export interface CorsAutoConfigurerPort {
  applyCorsConfiguration(domain: string): Promise<void>;
}
