import { saveToFirestore } from '../firebase';

// Función utilidad para limpiar campos undefined
const removeUndefinedFields = (data: Record<string, any>) => {
  // Crear una copia del objeto para no modificar el original
  const cleanedData: Record<string, any> = {};
  
  // Solo copiar campos que no son undefined
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      cleanedData[key] = data[key];
    }
  });
  
  return cleanedData;
};

// Servicio para manejar interacciones con Firestore
export const firestoreService = {
  // Guardar respuestas Ikigai
  async saveIkigaiResponses(data: {
    userName: string;
    love: string;
    talent: string;
    need: string;
    money?: string;
  }) {
    console.log('[FirestoreService] Guardando respuestas Ikigai:', data);
    return saveToFirestore('ikigai_responses', removeUndefinedFields(data));
  },

  // Guardar código promocional
  async savePromoCode(data: {
    name: string;
    email: string;
    promoCode: string;
    city?: string;
    houseAddress?: string;
    company?: string;
  }) {
    console.log('[FirestoreService] Guardando código promocional:', data);
    return saveToFirestore('promo_codes', removeUndefinedFields(data));
  },

  // Guardar datos de compra
  async savePurchase(data: {
    userName: string;
    email: string;
    lastName?: string;
    idType?: string;
    idNumber?: string;
    telephone?: string;
    city?: string;
    houseAddress?: string;
    typePerson?: string;
    purchaseType: 'personal' | 'gift';
    giftEmail?: string;
    giftMessage?: string;
  }) {
    console.log('[FirestoreService] Guardando datos de compra:', data);
    return saveToFirestore('purchases', removeUndefinedFields(data));
  }
}; 