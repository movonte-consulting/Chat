import { sequelize } from '../../../../config/database';
import { JiraAccountRecord, JiraCredentials, UpsertJiraAccountsInput } from '../../domain/modelos/jira-account.model';
import { JiraAccountRepositoryPort } from '../../domain/interfaces/jira-account-repository.port';

export class JiraAccountRepository implements JiraAccountRepositoryPort {
  async findByUserAndService(userId: number, serviceId: string): Promise<JiraAccountRecord | null> {
    const [accounts] = await sequelize.query(`
      SELECT
        id, user_id, service_id,
        assistant_jira_email, assistant_jira_url,
        widget_jira_email, widget_jira_url,
        is_active, created_at, updated_at
      FROM service_jira_accounts
      WHERE user_id = :userId AND service_id = :serviceId
      LIMIT 1
    `, { replacements: { userId, serviceId } }) as any;

    return accounts.length > 0 ? accounts[0] : null;
  }

  async verifyServiceAccess(userId: number, serviceId: string): Promise<boolean> {
    const [services] = await sequelize.query(`
      SELECT id FROM unified_configurations
      WHERE user_id = :userId AND service_id = :serviceId
      LIMIT 1
    `, { replacements: { userId, serviceId } }) as any;

    return services.length > 0;
  }

  async upsert(userId: number, serviceId: string, input: UpsertJiraAccountsInput): Promise<JiraAccountRecord> {
    const replacements = {
      userId,
      serviceId,
      assistantJiraEmail: input.assistantJiraEmail || null,
      assistantJiraToken: input.assistantJiraToken || null,
      assistantJiraUrl: input.assistantJiraUrl || null,
      widgetJiraEmail: input.widgetJiraEmail || null,
      widgetJiraToken: input.widgetJiraToken || null,
      widgetJiraUrl: input.widgetJiraUrl || null,
      isActive: input.isActive !== undefined ? input.isActive : true
    };

    const [existing] = await sequelize.query(`
      SELECT id FROM service_jira_accounts
      WHERE user_id = :userId AND service_id = :serviceId
      LIMIT 1
    `, { replacements: { userId, serviceId } }) as any;

    if (existing.length > 0) {
      await sequelize.query(`
        UPDATE service_jira_accounts
        SET
          assistant_jira_email = :assistantJiraEmail,
          assistant_jira_token = :assistantJiraToken,
          assistant_jira_url = :assistantJiraUrl,
          widget_jira_email = :widgetJiraEmail,
          widget_jira_token = :widgetJiraToken,
          widget_jira_url = :widgetJiraUrl,
          is_active = :isActive,
          updated_at = NOW()
        WHERE user_id = :userId AND service_id = :serviceId
      `, { replacements });
      console.log('✅ Cuentas de Jira actualizadas');
    } else {
      await sequelize.query(`
        INSERT INTO service_jira_accounts (
          user_id, service_id,
          assistant_jira_email, assistant_jira_token, assistant_jira_url,
          widget_jira_email, widget_jira_token, widget_jira_url,
          is_active
        ) VALUES (
          :userId, :serviceId,
          :assistantJiraEmail, :assistantJiraToken, :assistantJiraUrl,
          :widgetJiraEmail, :widgetJiraToken, :widgetJiraUrl,
          :isActive
        )
      `, { replacements });
      console.log('✅ Cuentas de Jira creadas');
    }

    return (await this.findByUserAndService(userId, serviceId))!;
  }

  async delete(userId: number, serviceId: string): Promise<void> {
    await sequelize.query(`
      DELETE FROM service_jira_accounts
      WHERE user_id = :userId AND service_id = :serviceId
    `, { replacements: { userId, serviceId } });
  }

  async getAssistantAccount(userId: number, serviceId: string): Promise<JiraCredentials | null> {
    const [accounts] = await sequelize.query(`
      SELECT assistant_jira_email, assistant_jira_token, assistant_jira_url
      FROM service_jira_accounts
      WHERE user_id = :userId
        AND service_id = :serviceId
        AND is_active = true
        AND assistant_jira_email IS NOT NULL
        AND assistant_jira_token IS NOT NULL
      LIMIT 1
    `, { replacements: { userId, serviceId } }) as any;

    if (accounts.length === 0) return null;

    return {
      email: accounts[0].assistant_jira_email,
      token: accounts[0].assistant_jira_token,
      url: accounts[0].assistant_jira_url
    };
  }

  async getWidgetAccount(userId: number, serviceId: string): Promise<JiraCredentials | null> {
    const [accounts] = await sequelize.query(`
      SELECT widget_jira_email, widget_jira_token, widget_jira_url
      FROM service_jira_accounts
      WHERE user_id = :userId
        AND service_id = :serviceId
        AND is_active = true
        AND widget_jira_email IS NOT NULL
        AND widget_jira_token IS NOT NULL
      LIMIT 1
    `, { replacements: { userId, serviceId } }) as any;

    if (accounts.length === 0) return null;

    return {
      email: accounts[0].widget_jira_email,
      token: accounts[0].widget_jira_token,
      url: accounts[0].widget_jira_url
    };
  }
}
