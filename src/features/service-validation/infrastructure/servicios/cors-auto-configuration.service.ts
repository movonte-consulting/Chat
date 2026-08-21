import { DatabaseService } from '../../../../services/database_service';
import { CorsService } from '../../../../services/cors_service';

export class CorsAutoConfigurationService {
  private static instance: CorsAutoConfigurationService;
  private dbService: DatabaseService;
  private corsService: CorsService;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
    this.corsService = CorsService.getInstance();
  }

  public static getInstance(): CorsAutoConfigurationService {
    if (!CorsAutoConfigurationService.instance) {
      CorsAutoConfigurationService.instance = new CorsAutoConfigurationService();
    }
    return CorsAutoConfigurationService.instance;
  }

  // Aplicar configuración de CORS (esto se ejecutaría automáticamente al aprobar)
  async applyCorsConfiguration(domain: string): Promise<void> {
    try {
      console.log(`🔧 Applying CORS configuration for domain: ${domain}`);

      // Verificar que el dominio sea válido
      if (!domain || !this.isValidDomain(domain)) {
        throw new Error(`Dominio inválido: ${domain}`);
      }

      // 1. Agregar el dominio a la lista de dominios aprobados en la base de datos
      await this.addApprovedDomain(domain);

      // 2. Actualizar inmediatamente el CorsService para que esté disponible sin esperar el refresh del caché
      await this.corsService.addApprovedDomain(domain);

      // 3. Actualizar la configuración de CORS en tiempo real (para mantener consistencia con process.env)
      await this.updateCorsConfiguration(domain);

      console.log(`✅ CORS configuration applied successfully for domain: ${domain}`);
      console.log(`   - Guardado en BD: ✅`);
      console.log(`   - Actualizado en CorsService: ✅`);
      console.log(`   - Disponible inmediatamente sin reiniciar: ✅`);

    } catch (error) {
      console.error('❌ Error applying CORS configuration:', error);
      throw error;
    }
  }

  // Validar que el dominio sea válido
  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
    return domainRegex.test(domain);
  }

  // Agregar dominio aprobado a la base de datos
  private async addApprovedDomain(domain: string): Promise<void> {
    try {
      // Crear o actualizar registro de dominio aprobado
      await this.dbService.createOrUpdateServiceConfig({
        serviceId: `cors-domain-${domain}`,
        serviceName: `CORS Domain: ${domain}`,
        assistantId: 'CORS',
        assistantName: 'CORS Configuration',
        isActive: true,
        lastUpdated: new Date()
      });

      console.log(`✅ Domain ${domain} added to approved domains database`);
    } catch (error) {
      console.error(`❌ Error adding domain ${domain} to database:`, error);
      throw error;
    }
  }

  // Actualizar configuración de CORS en tiempo real
  private async updateCorsConfiguration(domain: string): Promise<void> {
    try {
      // Obtener la lista actual de dominios permitidos
      const currentOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

      // Verificar si el dominio ya está en la lista
      const domainExists = currentOrigins.some(origin =>
        origin.trim() === domain || origin.trim() === `https://${domain}` || origin.trim() === `http://${domain}`
      );

      if (!domainExists) {
        // Agregar el dominio a la lista
        const newOrigins = [...currentOrigins, `https://${domain}`, `http://${domain}`];
        process.env.ALLOWED_ORIGINS = newOrigins.join(',');

        console.log(`✅ Domain ${domain} added to ALLOWED_ORIGINS environment variable`);
        console.log(`📋 Updated ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS}`);
      } else {
        console.log(`ℹ️ Domain ${domain} already exists in ALLOWED_ORIGINS`);
      }

    } catch (error) {
      console.error(`❌ Error updating CORS configuration for domain ${domain}:`, error);
      throw error;
    }
  }

  // Obtener dominios aprobados desde la base de datos
  public async getApprovedDomains(): Promise<string[]> {
    try {
      const approvedDomains = await this.dbService.getAllServiceConfigs();

      // Filtrar solo los dominios CORS aprobados
      const corsDomains = approvedDomains
        .filter((config: any) => config.serviceId.startsWith('cors-domain-'))
        .map((config: any) => config.serviceId.replace('cors-domain-', ''));

      console.log(`📋 Found ${corsDomains.length} approved CORS domains:`, corsDomains);
      return corsDomains;
    } catch (error) {
      console.error('❌ Error getting approved domains:', error);
      return [];
    }
  }
}
