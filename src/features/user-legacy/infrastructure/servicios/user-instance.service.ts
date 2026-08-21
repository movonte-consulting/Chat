import { UserInstance } from '../../../../models';

interface UserInstanceConfiguration {
  id?: number;
  instanceName: string;
  instanceDescription?: string;
  isActive: boolean;
  settings?: any;
}

// Sin caché en memoria: cada llamada consulta la BD directamente (igual que el
// comportamiento original de UserConfigurationService para estos métodos).

export async function createInstance(userId: number, config: UserInstanceConfiguration): Promise<UserInstance> {
  try {
    const instance = await UserInstance.create({
      userId,
      instanceName: config.instanceName,
      instanceDescription: config.instanceDescription,
      isActive: config.isActive,
      settings: config.settings
    });

    console.log(`✅ Instance created for user ${userId}: ${config.instanceName}`);
    return instance;
  } catch (error) {
    console.error(`❌ Error creating instance for user ${userId}:`, error);
    throw error;
  }
}

export async function getUserInstances(userId: number): Promise<UserInstance[]> {
  try {
    return await UserInstance.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  } catch (error) {
    console.error(`❌ Error getting instances for user ${userId}:`, error);
    throw error;
  }
}

export async function updateInstance(userId: number, instanceId: number, config: Partial<UserInstanceConfiguration>): Promise<void> {
  try {
    await UserInstance.update(config, {
      where: { id: instanceId, userId }
    });
    console.log(`✅ Instance updated for user ${userId}: ${instanceId}`);
  } catch (error) {
    console.error(`❌ Error updating instance for user ${userId}:`, error);
    throw error;
  }
}

export async function deleteInstance(userId: number, instanceId: number): Promise<void> {
  try {
    await UserInstance.destroy({
      where: { id: instanceId, userId }
    });
    console.log(`✅ Instance deleted for user ${userId}: ${instanceId}`);
  } catch (error) {
    console.error(`❌ Error deleting instance for user ${userId}:`, error);
    throw error;
  }
}
