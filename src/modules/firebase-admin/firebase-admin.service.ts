import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { Notification } from 'src/mongoose/notification';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseAdminService {
  private readonly firebaseApp: admin.app.App;

  constructor(private readonly configService: ConfigService) {
    const serviceAccount = require(
      this.configService.get('FIREBASE_ADMIN_FILE_PATH'),
    ); // Update path

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Optionally, add databaseURL if using Realtime Database
      // databaseURL: 'https://<your-database-name>.firebaseio.com',
    });
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserInfo | null> {
    try {
      const user = await this.firebaseApp.auth().getUser(uid);
      console.log('---------', user);
      return user.providerData[0];
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  async sendNotification(token: string, notification: Notification) {
    try {
      const message = {
        token: token,
        data: {
          notification: JSON.stringify(notification),
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.description,
              },
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const result = await admin.messaging().send(message);
      console.log('Notification sent successfully!', result);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}
