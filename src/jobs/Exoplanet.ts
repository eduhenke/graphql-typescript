import axios, { AxiosInstance } from 'axios';
import { getConnection } from 'typeorm';
import { Planet } from '../modules/Planets/entity/Planet';
import IPlanet from '../modules/Planets/entity/IPlanet';

/**
 * @TODO: Refactor this to work with request queue
 */
export default class Exoplanet {
  private API: AxiosInstance = axios.create({ baseURL: 'https://api.arcsecond.io/' });

  private getRequests(pages: number) {
    let requests = [];
    for (let i = 1; i <= pages; i++) {
      requests.push(this.API.get('exoplanets', { params: { page: i } }))
    }
    return requests;
  }
  
  // ou podemos fazer de um jeito funcional mais curto:
  private getRequestsFunctional(pages: number) {
    return Array
      .from({ length: pages })
      .map((_, i) => this.API.get('exoplanets', { params: { page: i+1 } }))
  }

  // como podemos ter um erro ao chamar essa função
  // e é bem interessante sabermos se deu erro
  // poderíamos ou dar um throw em um error e mudar a assinatura da função pra Promise<void>
  // ou também poderíamos mudar a assinatura da função pra Promise<Error | undefined> e 
  // tratar o erro em quem chama a função
  async getExoplanets(): Promise<void> {
    const planetsCount = await Planet.getRepository()
      .createQueryBuilder()
      .select('DISTINCT(`sender_id`)')
      .getCount();

    if (!planetsCount) {
      console.log('Getting new exoplanets...');

      const pages = 10;

      // do jeito que tava iriamos esperar sequencialmente
      // todas as páginas serem coletadas
      // podemos fazer em paralelo as requisições:

      const responses = await Promise.all(this.getRequests(pages))
      const planets: IPlanet[] = responses
        .flatMap(({ data }) => data.results)
        .filter(
          (planet) =>
            // podemos deixar mais curto usando o operador ? (precisamos usar o TS 3.7 daí)
            planet?.mass?.value >= 25 &&
            planet?.mass?.unit === 'M_jup',
        )
        .map((planet) => ({
          name: planet.name,
          mass: planet.mass.value,
          hasStation: false,
        }));

      console.log('Successfully scraped all planets');

      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Planet)
        .values(planets)
        .execute();
    }
  }
}
