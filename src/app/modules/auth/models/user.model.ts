import { AuthModel } from './auth.model';
import { AddressModel } from './address.model';
import { SocialNetworksModel } from './social-networks.model';

export class UserModel extends AuthModel {
    id: number;
    name: string;
    notlp: number;
    username: string;
    password: string;
    instansi_id: number;
    instansi_nama: string;
    kategori_id: number;
    kategori_nama: string;
    is_active: number;
    active_des: string;
    // fullname: string;
    email_instansi: string;
    email: string;
    pic: string;
    roles: string[] = [];
    permissions: string[] = [];
    menus: string[] = [];
    organization: any;
    // occupation: string;
    // companyName: string;
    // phone: string;
    // address?: AddressModel;
    // socialNetworks?: SocialNetworksModel;
    // // personal information
    // firstname: string;
    // lastname: string;
    // website: string;
    // // account information
    // language: string;
    // timeZone: string;
    // communication: {
    //     email: boolean;
    //     sms: boolean;
    //     phone: boolean;
    // };
    // // email settings
    // emailSettings?: {
    //     emailNotification: boolean;
    //     sendCopyToPersonalEmail: boolean;
    //     activityRelatesEmail: {
    //         youHaveNewNotifications: boolean;
    //         youAreSentADirectMessage: boolean;
    //         someoneAddsYouAsAsAConnection: boolean;
    //         uponNewOrder: boolean;
    //         newMembershipApproval: boolean;
    //         memberRegistration: boolean;
    //     };
    //     updatesFromKeenthemes: {
    //         newsAboutKeenthemesProductsAndFeatureUpdates: boolean;
    //         tipsOnGettingMoreOutOfKeen: boolean;
    //         thingsYouMissedSindeYouLastLoggedIntoKeen: boolean;
    //         newsAboutMetronicOnPartnerProductsAndOtherServices: boolean;
    //         tipsOnMetronicBusinessProducts: boolean;
    //     };
    // };

    setUser(_user: unknown) {
        const user = _user as UserModel;
        this.id = user.id;
        this.name = user.name || '';
        this.password = user.password || '';
        // this.fullname = user.fullname || '';
        this.email = user.email || '';
        this.pic = user.pic || './assets/media/avatars/blank.png';
        this.roles = user.roles || [];
        this.permissions = user.permissions || [];
        this.menus = user.menus || [];
        // this.occupation = user.occupation || '';
        // this.companyName = user.companyName || '';
        // this.phone = user.phone || '';
        // this.address = user.address;
        // this.socialNetworks = user.socialNetworks;
    }
}
