const AdminJS = require('adminjs');
const { BaseDatabase } = require('@adminjs/base-database');

class MongoDbAdapter extends BaseDatabase {
  constructor(connectionUrl) {
    super();
    this.connectionUrl = connectionUrl;
  }

  async connect() {
    if (this.client) {
      return this.client;
    }
    const { MongoClient } = require('mongodb');
    this.client = await MongoClient.connect(this.connectionUrl);
    return this.client;
  }

  async find(resource, filter) {
    const collection = await this.getCollection(resource);
    return collection.find(filter).toArray();
  }

  async findOne(resource, filter) {
    const collection = await this.getCollection(resource);
    return collection.findOne(filter);
  }

  async create(resource, params) {
    const collection = await this.getCollection(resource);
    return collection.insertOne(params);
  }

  async update(resource, id, params) {
    const collection = await this.getCollection(resource);
    return collection.updateOne({ _id: id }, { $set: params });
  }

  async delete(resource, id) {
    const collection = await this.getCollection(resource);
    return collection.deleteOne({ _id: id });
  }

  async count(resource, filter) {
    const collection = await this.getCollection(resource);
    return collection.countDocuments(filter);
  }

  async getCollection(resource) {
    const { database, collection } = resource;
    const client = await this.connect();
    const db = client.db(database);
    return db.collection(collection);
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

module.exports = MongoDbAdapter;
