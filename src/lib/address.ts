export interface ViaCepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

export async function fetchAddressFromCEP(cep: string): Promise<ViaCepResponse | null> {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch CEP from BrasilAPI:', err);
    return null;
  }
}

export interface StateResponse {
  id: number;
  sigla: string;
  nome: string;
}

export interface CityResponse {
  nome: string;
  codigo_ibge: string;
}

export async function fetchStates(): Promise<StateResponse[]> {
  try {
    const response = await fetch('https://brasilapi.com.br/api/ibge/uf/v1');
    if (!response.ok) return [];
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch States from BrasilAPI:', err);
    return [];
  }
}

export async function fetchCities(stateCode: string): Promise<CityResponse[]> {
  if (!stateCode) return [];
  try {
    // using providers helps bypass some unavailabilities in the main provider
    const response = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${stateCode}?providers=dados-abertos-br,gov,wikipedia`);
    if (!response.ok) return [];
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Failed to fetch Cities for ${stateCode} from BrasilAPI:`, err);
    return [];
  }
}
