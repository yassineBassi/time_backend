import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseAdminService {
  private readonly firebaseApp: admin.app.App;

  constructor() {
    const serviceAccount = require('../../../time-firebase-service-account-key.json'); // Update path

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Optionally, add databaseURL if using Realtime Database
      // databaseURL: 'https://<your-database-name>.firebaseio.com',
    });
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserInfo | null> {
    try {
      const user = await this.firebaseApp.auth().getUser(uid);
      console.log("---------", user);
      return user.providerData[0];
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }
}
