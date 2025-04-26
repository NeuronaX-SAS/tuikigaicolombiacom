import { type RequestHandler } from '@builder.io/qwik-city';
import type { IkigaiResponse } from '../../../services/GoogleSheetsService';
import { addIkigaiResponse } from '../../../../utils/googleSheetUtils';

// Handler para procesar las solicitudes POST
export const onPost: RequestHandler = async ({ request, json }) => {
  console.log('🟢 [API /api/save-ikigai] Recibiendo solicitud');
  try {
    const body = await request.json() as IkigaiResponse;
    console.log('🟢 [API /api/save-ikigai] Body recibido:', JSON.stringify(body));

    // Validar datos requeridos
    if (!body.userName || !body.love || !body.talent || !body.need || !body.payment) {
      console.error('🔴 [API /api/save-ikigai] Datos incompletos:', body);
      json(400, { 
        success: false, 
        error: 'Faltan campos requeridos' 
      });
      return;
    }
    
    try {
      // Usar la implementación mock de googleSheetUtils
      await addIkigaiResponse({
        userName: body.userName,
        love: body.love,
        talent: body.talent,
        need: body.need,
        payment: body.payment,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ [API /api/save-ikigai] Datos guardados exitosamente');
      json(200, { 
        success: true, 
        message: 'Datos de Ikigai guardados correctamente' 
      });
      
    } catch (saveError: any) {
      console.error('❌ [API /api/save-ikigai] Error guardando datos:', saveError);
      json(500, { 
        success: false, 
        error: 'Error guardando datos: ' + (saveError.message || 'Error desconocido')
      });
    }
    
  } catch (parseError: any) {
    console.error('🔴 [API /api/save-ikigai] Error parseando body:', parseError);
    json(400, { success: false, error: 'Formato de solicitud inválido: ' + (parseError.message || 'Error desconocido') });
  }
};

export const onGet: RequestHandler = ({ json }) => {
  console.log('🟡 [API /api/save-ikigai] GET request - Method Not Allowed.');
  json(405, { error: 'Method Not Allowed' });
};