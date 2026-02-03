import { OpenAPIV2 } from 'openapi-types';

export const updateSwaggerV2 = (swagger: OpenAPIV2.Document) => {
  if (!swagger.paths) return;

  for (const path of Object.values<any>(swagger.paths)) {
    for (const method of Object.values<any>(path)) {
      if (!method || !method.parameters) continue;

      for (const param of method.parameters) {
        if (param.in !== 'body' && !param.type) {
          param.type = 'string';
        }
      }
    }
  }
};
