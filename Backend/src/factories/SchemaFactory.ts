export class SchemaFactory {
  /**
   * Generates a Mongoose-compatible schema definition from the common schema object.
   */
  static getMongooseSchema(commonSchema: any): any {
    const mongooseSchema: any = {};

    for (const [key, definition] of Object.entries(commonSchema)) {
      const field: any = definition;
      
      if (field.type === 'array') {
        // Handle arrays (e.g., messages in Chat)
        mongooseSchema[key] = [this.getMongooseSchema(field.items)];
      } else {
        mongooseSchema[key] = {
          type: this.toMongooseType(field.type),
          required: !!field.required,
          ...(field.enum ? { enum: field.enum } : {}),
        };
      }
    }

    return mongooseSchema;
  }

  /**
   * Generates a Redis OM compatible schema definition from the common schema object.
   * Note: This assumes Redis Stack with JSON capability.
   */
  static getRedisSchema(commonSchema: any): any {
    const redisSchema: any = {};

    for (const [key, definition] of Object.entries(commonSchema)) {
      const field: any = definition;

      // Redis OM types: string, number, boolean, text, date, point, string[]
      if (field.type === 'array') {
        // Redis OM handles nested objects in JSON mode
        // For simplicity, we'll mark it as a 'string' or 'text' if indexed, 
        // but Redis OM Schema for JSON can be more complex.
        // Returning as is for basic JSON support.
        redisSchema[key] = { type: 'string' }; 
      } else {
        redisSchema[key] = {
          type: this.toRedisType(field.type, key),
        };
      }
    }

    return redisSchema;
  }

  private static toMongooseType(type: string): any {
    switch (type) {
      case 'string': return String;
      case 'number': return Number;
      case 'boolean': return Boolean;
      case 'date': return Date;
      default: return Object;
    }
  }

  private static toRedisType(type: string, key: string): string {
    // 'text' is used for full-text search in Redis OM
    if (key === 'message' || key === 'title') return 'text';
    
    switch (type) {
      case 'string': return 'string';
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'date': return 'date';
      default: return 'string';
    }
  }
}
