import log from '../lib/logger';

export default function getModelByIdFactory(findModel) {
  return async function getModelById(httpRequest) {
    log({ function: 'findModel' });
    try {
      const { source = {} } = httpRequest.body
      source.ip = httpRequest.ip
      source.browser = httpRequest.headers['User-Agent']
      if (httpRequest.headers['Referer']) {
        source.referrer = httpRequest.headers['Referer']
      }
      log(source);
      const id = httpRequest.params.id;

      const model = await findModel(id);
      log({ function: findModel.name, ...model });

      return {
        headers: {
          'Content-Type': 'application/json',
        },
        statusCode: 200,
        body: { model }
      }
    } catch (e) {
      log(e);

      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: 400,
        body: {
          error: e.message
        }
      }
    }
  }
}
