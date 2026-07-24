import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, Input } from '@/components/ui/Foundation';
import type { AiProviderProfile, SecretSourceType } from '../types';

interface ProviderDetailModalProps {
  provider: AiProviderProfile | null;
  open: boolean;
  onClose: () => void;
  onSave: (
    providerName: string,
    changes: Partial<AiProviderProfile['configuration']> & {
      apiKey?: string;
      secretSource?: SecretSourceType;
      secretKeyName?: string;
      isDefault?: boolean;
      fallbackProvider?: string;
    },
  ) => void;
  allProviders: string[];
}

export function ProviderDetailModal({
  provider,
  open,
  onClose,
  onSave,
  allProviders,
}: ProviderDetailModalProps) {
  if (!provider) return null;

  const [endpoint, setEndpoint] = useState(provider.configuration.endpoint);
  const [model, setModel] = useState(provider.configuration.model);
  const [temperature, setTemperature] = useState(provider.configuration.temperature);
  const [timeout, setTimeoutVal] = useState(provider.configuration.timeout);
  const [maxRetry, setMaxRetry] = useState(provider.configuration.maxRetry);
  const [priority, setPriority] = useState(provider.priority);
  const [enabled, setEnabled] = useState(provider.enabled);
  const [isDefault, setIsDefault] = useState(provider.isDefault);
  const [secretSource, setSecretSource] = useState<SecretSourceType>(
    provider.secretBinding.sourceType,
  );
  const [secretKeyName, setSecretKeyName] = useState(provider.secretBinding.keyName);
  const [apiKey, setApiKey] = useState('');
  const [fallbackProvider, setFallbackProvider] = useState(provider.fallbackProvider || '');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave(provider.provider, {
      endpoint,
      model,
      temperature,
      timeout,
      maxRetry,
      priority,
      enabled,
      isDefault,
      secretSource,
      secretKeyName,
      apiKey: apiKey.trim() || undefined,
      fallbackProvider: fallbackProvider || undefined,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${provider.provider} Integration Profile`}
      description="Configure model endpoint, secret binding provider, execution policy, and priorities."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <label className="block font-medium">
            Secret Management Source
            <select
              className="studio-select mt-1.5"
              value={secretSource}
              onChange={(e) => setSecretSource(e.target.value as SecretSourceType)}
            >
              <option value="InMemory">InMemory (Obfuscated)</option>
              <option value="EnvironmentVariable">Environment Variable</option>
              <option value="AzureKeyVault">Azure Key Vault</option>
              <option value="AwsSecretsManager">AWS Secrets Manager</option>
              <option value="EncryptedDatabase">Encrypted Database</option>
            </select>
          </label>
          <label className="block font-medium">
            Secret Key Identifier
            <Input
              className="mt-1.5"
              value={secretKeyName}
              onChange={(e) => setSecretKeyName(e.target.value)}
              placeholder="e.g. OPENAI_API_KEY"
            />
          </label>
        </div>

        <label className="block font-medium">
          API Key / Secret Token (Masked: {provider.secretBinding.maskedValue})
          <Input
            type="password"
            className="mt-1.5"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Leave blank to keep existing bound secret value"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block font-medium">
            Endpoint Base URL
            <Input
              className="mt-1.5"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              required
            />
          </label>
          <label className="block font-medium">
            Default Model Name
            <Input
              className="mt-1.5"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <label className="block font-medium">
            Temperature: {temperature}
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              className="mt-2 w-full accent-primary"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
            />
          </label>
          <label className="block font-medium">
            Timeout (seconds)
            <Input
              type="number"
              min="5"
              max="300"
              className="mt-1.5"
              value={timeout}
              onChange={(e) => setTimeoutVal(Number(e.target.value))}
            />
          </label>
          <label className="block font-medium">
            Max Retries
            <Input
              type="number"
              min="0"
              max="10"
              className="mt-1.5"
              value={maxRetry}
              onChange={(e) => setMaxRetry(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
          <label className="block font-medium">
            Selection Priority (Lower = higher priority)
            <Input
              type="number"
              min="1"
              max="100"
              className="mt-1.5"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            />
          </label>

          <label className="block font-medium">
            Fallback Provider
            <select
              className="studio-select mt-1.5"
              value={fallbackProvider}
              onChange={(e) => setFallbackProvider(e.target.value)}
            >
              <option value="">None (Fail fast)</option>
              {allProviders
                .filter((p) => p !== provider.provider)
                .map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-6 border-t border-border pt-3">
          <label className="flex items-center gap-2 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="size-4 accent-primary"
            />
            Enable Provider
          </label>
          <label className="flex items-center gap-2 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="size-4 accent-primary"
            />
            Set as Primary Default Provider
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Profile & Binding</Button>
        </div>
      </form>
    </Dialog>
  );
}
