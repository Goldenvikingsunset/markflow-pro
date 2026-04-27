import * as vscode from 'vscode';
import * as https from 'https';
import { logger } from '../utils/logger';
import { Strings } from '../utils/strings';

const SECRET_KEY = 'markflowPro.licenceKey';
const LAST_VALIDATED_KEY = 'markflowPro.lastValidated';
const VALIDATION_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;  // 7 days
const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;          // 3 days

interface ValidateResponse {
  valid: boolean;
  error?: string;
}

export class LicenceManager implements vscode.Disposable {
  private _isActivated = false;
  private readonly _onActivationChanged = new vscode.EventEmitter<boolean>();
  readonly onActivationChanged = this._onActivationChanged.event;

  constructor(private readonly context: vscode.ExtensionContext) {}

  isActivated(): boolean {
    return this._isActivated;
  }

  async validateOnStartup(): Promise<void> {
    const key = await this.context.secrets.get(SECRET_KEY);
    if (!key) { return; }

    const lastValidated = this.context.globalState.get<number>(LAST_VALIDATED_KEY, 0);
    const now = Date.now();

    if (now - lastValidated < VALIDATION_INTERVAL_MS) {
      // Within 7-day window — trust cached state
      this._setActivated(true);
      logger.log('Licence valid (cached)');
      return;
    }

    try {
      const valid = await this._callValidateApi(key);
      if (valid) {
        this._setActivated(true);
        await this.context.globalState.update(LAST_VALIDATED_KEY, now);
        logger.log('Licence re-validated');
      } else {
        await this._clearActivation();
        logger.log('Licence re-validation failed — deactivated');
      }
    } catch {
      // Network error — check grace period
      const withinGrace = now - lastValidated < VALIDATION_INTERVAL_MS + GRACE_PERIOD_MS;
      if (withinGrace) {
        this._setActivated(true);
        logger.log('Licence offline — grace period active');
      } else {
        await this._clearActivation();
        vscode.window.showWarningMessage(Strings.licenceOfflineExpired);
        logger.log('Licence grace period expired — deactivated');
      }
    }
  }

  async activate(key: string): Promise<boolean> {
    const trimmed = key.trim();
    if (!trimmed) {
      vscode.window.showErrorMessage(Strings.licenceInvalid);
      return false;
    }

    try {
      const valid = await this._callValidateApi(trimmed);
      if (valid) {
        await this.context.secrets.store(SECRET_KEY, trimmed);
        await this.context.globalState.update(LAST_VALIDATED_KEY, Date.now());
        this._setActivated(true);
        vscode.window.showInformationMessage(Strings.licenceActivated);
        logger.log('Licence activated');
        return true;
      }
      vscode.window.showErrorMessage(Strings.licenceInvalid);
      logger.log('Licence activation failed: invalid key');
      return false;
    } catch (err) {
      vscode.window.showErrorMessage(Strings.licenceNetworkError);
      logger.log(`Licence activation error: ${err}`);
      return false;
    }
  }

  async deactivate(): Promise<void> {
    await this._clearActivation();
    logger.log('Licence deactivated');
  }

  private async _clearActivation(): Promise<void> {
    await this.context.secrets.delete(SECRET_KEY);
    await this.context.globalState.update(LAST_VALIDATED_KEY, 0);
    this._setActivated(false);
  }

  private _setActivated(value: boolean): void {
    if (this._isActivated !== value) {
      this._isActivated = value;
      this._onActivationChanged.fire(value);
    }
  }

  private _callValidateApi(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        license_key: key,
        instance_name: 'vscode-markflow-pro',
      });

      const req = https.request(
        {
          hostname: 'api.lemonsqueezy.com',
          path: '/v1/licenses/validate',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk: string) => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed: ValidateResponse = JSON.parse(data);
              resolve(parsed.valid === true);
            } catch {
              reject(new Error('Invalid JSON from licence server'));
            }
          });
        }
      );

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  dispose(): void {
    this._onActivationChanged.dispose();
  }
}

// Module-level singleton — initialized by extension.ts activate()
let _instance: LicenceManager | null = null;

export function initLicenceManager(context: vscode.ExtensionContext): LicenceManager {
  _instance = new LicenceManager(context);
  return _instance;
}

export function isProActivated(): boolean {
  return _instance?.isActivated() ?? false;
}
