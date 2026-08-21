/** Persistencia diaria de estadísticas de webhook en base de datos (DatabaseService). */
export interface WebhookStatsPersistencePort {
  recordResult(success: boolean): Promise<void>;
}
