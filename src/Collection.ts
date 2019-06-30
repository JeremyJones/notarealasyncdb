import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { generate as generateId } from 'shortid';
import { Entity } from './Entity';

export class Collection<T extends Entity> {
  private file: string;
  private entities: T[] = [];

  constructor(dir: string, private name: string) {
    this.file = join(dir, name + '.json');
    this.load();
  }

  create(obj: object, callback: CallableFunction = null): string {
    const entity = {id: generateId(), ...obj} as T;
    this.entities.push(entity);
    this.save();
    if (callback) return callback(entity)
    else return entity.id;
  }

  delete(id, callback: CallableFunction = null): void {
    const index = this.findIndex(id);
    this.entities.splice(index, 1);
    this.save();
    if (callback) callback(id)
  }

  get(id: string, callback: CallableFunction = null): T {
    const rec = this.entities.find((item) => item.id === id);
    if (callback) return callback(rec)
    else return rec
  }

  list(callback: CallableFunction = null): T[] {
    if (callback) return callback(this.entities)
    else return this.entities;
  }

  update(entity: T, callback: CallableFunction = null): void {
    const index = this.findIndex(entity.id);
    this.entities[index] = entity;
    this.save();
    if (callback) callback(this.entities[index])
  }

  private findIndex(id) {
    const index = this.entities.findIndex((current) => current.id === id);
    if (index === -1) {
      throw new Error(`No ${this.name} found with id "${id}"`);
    }
    return index;
  }

  private load() {
    if (existsSync(this.file)) {
      this.entities = JSON.parse(readFileSync(this.file, {encoding: 'utf8'}));
    }
  }

  private save() {
    writeFileSync(this.file, JSON.stringify(this.entities, null, 2), {encoding: 'utf8'});
  }
}
