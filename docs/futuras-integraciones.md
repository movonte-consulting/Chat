# Futuras integraciones: WhatsApp Embedded Signup, widget por script y personalización visual

## Resumen

Este documento consolida tres iniciativas evaluadas para simplificar la adopción del producto por parte de clientes sin equipo de desarrollo propio:

1. Migración del canal de WhatsApp de un número compartido a un modelo multi-tenant vía Meta Embedded Signup.
2. Instalación del widget de chat en cualquier sitio mediante un único script embebible, sin token manual ni build local.
3. Personalización visual del widget (colores, logo, textos) desde la configuración del servicio en el dashboard.

Las secciones 2 y 3 son independientes entre sí y de la sección 1; pueden implementarse en el corto plazo. La sección 1 es la de mayor alcance y depende de tiempos de aprobación externos a Movonte (Meta).

---

## 1. Migración a WhatsApp Embedded Signup

### 1.1 Objetivo

Permitir que cada cliente tenga su propio número de WhatsApp Business, con su propio nombre de perfil (branding propio), sin que el cliente necesite un desarrollador y sin que Movonte deba operar manualmente el aprovisionamiento de cada número.

### 1.2 Arquitectura actual

El canal de WhatsApp opera hoy sobre un único número compartido entre todos los servicios/clientes:

- `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_DEFAULT_USER_ID` son variables de entorno globales, definidas una sola vez para todo el sistema (`src/controllers/whatsapp_controller.ts`).
- Modelo de conversación en dos fases:
  - **Fase 1 (`pre_selection`)**: un agente de IA genérico presenta la lista de servicios disponibles (vía lista/botones interactivos de WhatsApp) y detecta la selección del cliente (tap, texto exacto, o function calling del agente).
  - **Fase 2 (`active`)**: se crea un ticket en Jira para el servicio elegido; cada mensaje entrante se agrega como comentario al ticket, y las respuestas del asistente específico del servicio se envían de regreso al cliente por WhatsApp.
- El webhook (`handleWebhook`) ya recibe `phone_number_id` en el payload de cada mensaje entrante (`value.metadata.phone_number_id`), pero actualmente ese valor no se usa para enrutar a distintos usuarios/servicios: todo el tráfico se asocia al mismo `WHATSAPP_DEFAULT_USER_ID`.

### 1.3 Limitaciones del modelo actual

- **Branding compartido**: todos los clientes aparecen ante sus propios usuarios finales bajo el mismo nombre de perfil de WhatsApp Business, el asociado al número compartido.
- **Riesgo compartido**: una baja en la calificación de calidad del número (por ejemplo, por reportes de spam de los usuarios de un solo cliente) afecta a todos los clientes simultáneamente.
- **Límite de conversaciones compartido**: el límite de conversaciones/24h de la Cloud API aplica al número, no por cliente; un cliente con alto volumen puede consumir el límite disponible para el resto.

### 1.4 Opciones evaluadas

| Opción | Fricción para el cliente | Branding | Aislamiento de riesgo | Esfuerzo de desarrollo | Operación recurrente para Movonte |
|---|---|---|---|---|---|
| Número compartido (actual) | Ninguna | Compartido | Ninguno | Ya existe | Ninguna |
| Número propio, alta manual del cliente en Meta | Alta (verificación de negocio manual) | Propio | Total | Bajo | Ninguna |
| Números propios administrados por Movonte (bajo la cuenta de Meta Business de Movonte) | Ninguna | Propio | Total | Bajo–medio | Alta (aprovisionar y dar de alta cada número manualmente) |
| BSP/revendedor (360dialog, Twilio, Gupshup) | Baja–media | Propio | Total | Medio | Media (gestión del proveedor externo) |
| **Embedded Signup (Meta Tech Provider)** | Baja (flujo guiado de unos minutos) | Propio | Total | Alto | Ninguna, una vez construido |

### 1.5 Opción recomendada

Dado que el desarrollo no es un factor limitante para Movonte y el objetivo del producto es que el cliente final nunca requiera un desarrollador, **Embedded Signup** es la opción recomendada como arquitectura objetivo. Es la única alternativa que resuelve simultáneamente:

- Onboarding sin desarrollador para el cliente.
- Sin carga operativa recurrente para Movonte por cada cliente nuevo.
- Branding y aislamiento de riesgo por cliente.

La única variable fuera del control de Movonte es el tiempo de revisión de Meta para aprobar el estatus de Tech Provider, que ocurre una sola vez (no por cliente).

### 1.6 Requisitos previos (una sola vez, del lado de Movonte)

1. Cuenta de Meta Business Manager para Movonte, con una app registrada en developers.facebook.com con el producto "WhatsApp Business Platform" habilitado.
2. Solicitud y aprobación del estatus de **Tech Provider / Solution Partner**, que implica una verificación de negocio de Movonte (no de cada cliente).
3. Un **System User** de la app, con un token de acceso permanente, utilizado por el backend para operar en nombre de cada WABA (WhatsApp Business Account) de cliente.
4. Integración del SDK de **Facebook Login for Business** en `movonte-dashboard`, configurado con un Configuration ID que define los permisos y el flujo de WhatsApp solicitado.

### 1.7 Flujo funcional (por cada cliente nuevo)

1. En el dashboard, el cliente ve un botón para conectar su WhatsApp dentro de la configuración del servicio.
2. Al hacer clic, se abre un flujo embebido de Meta (popup) donde el cliente inicia sesión con su cuenta de Facebook/Meta Business, o crea una en el momento.
3. Meta solicita el nombre del negocio y un número de teléfono, que puede ser nuevo o uno ya utilizado por el cliente (migración vía el mecanismo de coexistencia, para no perder el número existente).
4. Al finalizar, Meta devuelve un código de autorización al backend de Movonte.
5. El backend intercambia ese código por el `WABA ID` y el `phone_number_id` del cliente, y los asocia al servicio correspondiente.
6. A partir de ese momento, el System User de Movonte puede enviar y recibir mensajes en nombre de ese número, sin más intervención del cliente ni de Movonte.

### 1.8 Cambios técnicos requeridos

- **Base de datos**: nueva tabla `service_whatsapp_accounts`, siguiendo el mismo patrón ya utilizado por `service_jira_accounts` (credenciales por `user_id` + `service_id`, en este caso `waba_id`, `phone_number_id` y metadatos del perfil de negocio).
- **Backend**:
  - Endpoint para recibir el código de autorización del flujo de Embedded Signup e intercambiarlo por las credenciales del cliente.
  - Modificación de `whatsapp_controller.ts` para resolver el `phone_number_id` recibido en cada webhook contra `service_whatsapp_accounts`, en lugar de depender de un único `WHATSAPP_DEFAULT_USER_ID` global. Esto habilita el enrutamiento multi-tenant real.
  - Ajuste de los servicios de envío (`whatsapp_send_service.ts`) para operar con las credenciales resueltas por servicio en lugar de las variables de entorno globales.
- **Frontend (`movonte-dashboard`)**:
  - Integración del SDK de Facebook Login for Business.
  - Pantalla de estado de conexión de WhatsApp dentro de la configuración del servicio (conectado/desconectado, número asociado, nombre de perfil).

### 1.9 Consideraciones pendientes

- **Plantillas de mensajes**: los mensajes que inician conversación fuera de la ventana de 24 horas siguen requiriendo aprobación de Meta por plantilla. Se debe definir si Movonte gestiona las plantillas en nombre del cliente o si se expone una interfaz para que el propio cliente las administre.
- **Migración de clientes existentes**: los servicios que ya operan sobre el número compartido deberán mantenerse funcionando sin interrupción mientras se habilita el nuevo modelo; la migración a número propio debe ser opt-in por servicio, no un corte general.
- **Tiempo de aprobación de Meta**: al ser un proceso externo, se recomienda iniciar la solicitud de Tech Provider en paralelo al desarrollo de los cambios técnicos, no después.

### 1.10 Plan de fases sugerido

1. **Fase 1 (sin dependencia de Meta)**: crear `service_whatsapp_accounts` y modificar el enrutamiento del webhook para resolver `phone_number_id` por servicio, aunque inicialmente todos los servicios sigan apuntando al mismo número compartido. Esto deja la base técnica lista sin esperar la aprobación de Meta.
2. **Fase 2**: iniciar la solicitud de Tech Provider ante Meta.
3. **Fase 3**: construir el flujo de Embedded Signup (frontend y backend) en paralelo a la revisión de Meta.
4. **Fase 4**: habilitar la opción de número propio como upgrade opt-in por servicio, manteniendo el número compartido como opción por defecto.

---

## 2. Integración del widget mediante un único script

### 2.1 Objetivo

Permitir que un cliente instale el widget de chat en su sitio copiando y pegando un único fragmento de código, sin necesidad de generar ni rotar manualmente un token, y sin depender de un proyecto compilado localmente (como ocurre hoy con `widget-test`).

### 2.2 Estado actual

- El widget de prueba (`widget-test`) se configura editando manualmente `src/config.ts`, con un token protegido (JWT) copiado desde el dashboard.
- Ese token tiene una expiración (24 a 72 horas según configuración), por lo que requiere regeneración y actualización manual periódica.
- Instalarlo en un sitio real requeriría que el cliente compile y despliegue una aplicación React, lo cual no es viable para un cliente sin desarrollador.

### 2.3 Propuesta

Reemplazar el modelo de token de larga duración por un script de embed público, siguiendo el modelo utilizado por proveedores como Intercom o Crisp:

```html
<script src="https://chat.movonte.com/widget.js" data-service="ForgeInstance"></script>
```

El script, al cargarse en cualquier sitio:

1. Lee el `serviceId` desde el atributo `data-service`.
2. Solicita a un endpoint público un token de sesión de corta duración, validando el origen (dominio) de la petición contra una lista de dominios permitidos configurada por servicio.
3. Renderiza el widget de chat con ese token de sesión, sin exponer nunca credenciales de larga duración en el cliente.

Este modelo es equivalente al de las llaves públicas ("publishable keys") de proveedores como Stripe: el identificador del servicio es público y seguro de exponer, mientras que la validación real ocurre en el backend contra el dominio de origen.

### 2.4 Cambios técnicos requeridos

- **Backend**:
  - Endpoint público `GET /api/public/widget-session?serviceId=...`, sin autenticación de usuario, que:
    - Valida el header `Origin`/`Referer` contra los dominios permitidos configurados para ese servicio.
    - Emite un token de sesión de corta duración (minutos, no días) con el `serviceId` embebido.
  - Extender `unified_configurations.configuration` (o una tabla dedicada) para almacenar la lista de dominios permitidos por servicio.
- **Frontend**:
  - Construir un bundle independiente (`widget.js`) a partir de la lógica ya existente en `ChatWidget.tsx`, empaquetado para ser servido públicamente y cargado vía `<script>` en cualquier sitio, sin requerir un proyecto React del lado del cliente.
- **Dashboard**:
  - En la configuración del servicio, mostrar el fragmento de instalación listo para copiar, generado automáticamente con el `serviceId` correspondiente.

### 2.5 Consideraciones de seguridad

- El token de sesión emitido debe tener un alcance limitado (solo lectura/escritura sobre el chat del servicio, sin acceso a endpoints administrativos) y una expiración corta.
- La validación de dominio de origen es la barrera principal contra el uso no autorizado del `serviceId` en sitios no autorizados; debe aplicarse en el backend, no confiarse únicamente al frontend.
- Se recomienda aplicar límite de tasa (rate limiting) sobre el endpoint público de emisión de sesiones.

---

## 3. Personalización visual del widget por servicio

### 3.1 Objetivo

Permitir que, desde la configuración de un servicio en el dashboard, se pueda personalizar la apariencia del widget de chat (colores, logo/imagen, mensajes) sin intervención de un desarrollador.

### 3.2 Estado actual

- `unified_configurations.configuration` ya almacena un campo JSON de configuración libre por servicio, actualmente usado para datos como `projectKey`, `websiteUrl` y `requestedDomain`.
- No existe hoy ningún campo ni interfaz relacionados con la apariencia visual del widget.

### 3.3 Propuesta

Extender el JSON de configuración del servicio con un objeto de tema visual, por ejemplo:

```json
{
  "widgetTheme": {
    "primaryColor": "#5B21B6",
    "secondaryColor": "#F3F4F6",
    "logoUrl": "https://.../logo-cliente.png",
    "botName": "Asistente de Empresa X",
    "welcomeMessage": "Hola, ¿en qué podemos ayudarte?",
    "position": "bottom-right"
  }
}
```

### 3.4 Cambios técnicos requeridos

- **Backend**: endpoint para leer y actualizar `widgetTheme` dentro de la configuración del servicio (reutilizando los endpoints existentes de actualización de `unified_configurations`, o uno específico si se separa a una tabla propia). Incluir soporte para carga de imagen (logo), ya sea almacenando la URL de un archivo subido a un storage externo o aceptando directamente una URL provista por el cliente.
- **Dashboard**: formulario dentro de la configuración del servicio con selector de color, campo de carga/URL de logo, y campos de texto para nombre del asistente y mensaje de bienvenida, con una vista previa del widget en tiempo real.
- **Widget (`ChatWidget.tsx` y el futuro `widget.js` de la sección 2)**: al inicializar, obtener el tema visual del servicio junto con el token de sesión (o en una petición separada) y aplicarlo mediante variables CSS, en lugar de estilos fijos.

### 3.5 Relación con la sección 2

El endpoint público de sesión descrito en la sección 2.4 es el punto natural para devolver también el tema visual del servicio, de forma que el script de embed cargue en una sola petición tanto las credenciales de sesión como la apariencia configurada, sin pasos adicionales para el sitio que lo integra.

---

## Dependencias entre iniciativas

- Las secciones 2 y 3 no dependen de la sección 1 y pueden implementarse de inmediato; comparten además el mismo endpoint público de sesión, por lo que conviene diseñarlas juntas aunque se construyan en pasos separados.
- La sección 1 es independiente en su Fase 1 (cambios de base de datos y enrutamiento del webhook), pero sus fases posteriores dependen de tiempos de aprobación externos a Movonte.
