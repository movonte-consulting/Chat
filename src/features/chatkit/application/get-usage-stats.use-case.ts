export class GetUsageStatsUseCase {
  execute(userId: unknown) {
    console.log('🔄 Obteniendo estadísticas de uso para usuario:', userId);

    return {
      totalSessions: 0,
      totalMessages: 0,
      lastActivity: null,
      averageSessionDuration: 0
    };
  }
}
