export interface Env {
  $$routerCount: number;
  env: 'local' | 'development' | 'staging' | 'production';
  isLocal: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  title: string;
}
