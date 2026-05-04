import { UserFeatures } from '../types/chat';

interface SimpleUser {
  role?: string;
  isPro?: boolean;
}

export const useUserFeatures = (user: unknown): UserFeatures => {
  const u = user as SimpleUser;
  const fonctionUser: UserFeatures = {
    canJoinChannels: true,
    canSubscribeToChannels: true,
    canPostComments: true,
    canCreateChannels: false,
    canMonetizeContent: false,
    canCreatePaidCoupons: false,
    canWithdrawFunds: true,
    canSendVoiceMessages: false,
    canAccessAdvancedStats: false,
    canExportData: false,
    canDeleteOwnMessages: true,
    canReactToMessages: true,
    maxAttachmentSize: 5,
    maxChannelsJoined: 10,
    withdrawalFeePercentage: 10,
    minWithdrawalAmount: 50,
    withdrawalDays: ['friday', 'saturday'],
    withdrawalProcessingDays: ['saturday', 'sunday'],
    joinChannel: (channelId: string | number) => {
      console.log(`Utilisateur standard rejoint le canal ${channelId}`);
      return { success: true, message: 'Vous avez rejoint le canal' };
    },
    postComment: (channelId: string | number, comment: string) => {
      console.log(`Utilisateur standard poste un commentaire dans le canal ${channelId}: ${comment}`);
      return { success: true, message: 'Commentaire posté' };
    },
    deleteMessage: (channelId: string | number, messageId: string | number) => {
      console.log(`Utilisateur standard supprime le message ${messageId} dans le canal ${channelId}`);
      return { success: true, message: 'Message supprimé' };
    },
    requestWithdrawal: (amount: number) => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      if (!fonctionUser.withdrawalDays.includes(today)) {
        return { success: false, message: 'Les retraits ne sont autorisés que le vendredi et le samedi' };
      }
      if (amount < fonctionUser.minWithdrawalAmount) {
        return { success: false, message: `Le montant minimum de retrait est de ${fonctionUser.minWithdrawalAmount}€` };
      }
      const fee = amount * (fonctionUser.withdrawalFeePercentage / 100);
      const netAmount = amount - fee;
      return {
        success: true,
        message: `Votre demande de retrait de ${amount}€ a été enregistrée. Après déduction des frais de ${fee}€ (${fonctionUser.withdrawalFeePercentage}%), vous recevrez ${netAmount}€. Le traitement sera effectué ce week-end.`,
        fee,
        netAmount,
        processingDays: fonctionUser.withdrawalProcessingDays.join(' et ')
      };
    }
  };

  const fonctionPro: UserFeatures = {
    canJoinChannels: true,
    canSubscribeToChannels: true,
    canPostComments: true,
    canCreateChannels: true,
    canMonetizeContent: true,
    canCreatePaidCoupons: true,
    canWithdrawFunds: true,
    canSendVoiceMessages: true,
    canAccessAdvancedStats: true,
    canExportData: true,
    canDeleteOwnMessages: true,
    canReactToMessages: true,
    canRemoveUsersFromOwnChannels: true,
    withdrawalFeePercentage: 0,
    minWithdrawalAmount: 10,
    withdrawalDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    withdrawalProcessingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    maxAttachmentSize: 20,
    maxChannelsJoined: 50,
    joinChannel: (channelId: string | number) => ({ success: true, message: `Pro rejoint ${channelId}` }),
    postComment: (_channelId: string | number, comment: string) => ({ success: true, message: `Pro poste: ${comment}` }),
    deleteMessage: (_channelId: string | number, messageId: string | number) => ({ success: true, message: `Pro supprime ${messageId}` }),
    createChannel: (channelData: unknown) => {
      console.log(`Utilisateur Pro crée un nouveau canal`, channelData);
      return { success: true, message: 'Canal créé avec succès', channelId: 'new-channel-id' };
    },
    manageChannel: (channelId: string | number, action: string, data: unknown) => {
      console.log(`Utilisateur Pro effectue l'action ${action} sur le canal ${channelId}`, data);
      return { success: true, message: `Action ${action} effectuée sur le canal` };
    },
    removeUserFromChannel: (_channelId: string | number, _userId: string | number) => {
      console.log(`Utilisateur Pro supprime l'utilisateur ${_userId} du canal ${_channelId}`);
      return { success: true, message: `Utilisateur supprimé du canal` };
    },
    requestWithdrawal: (amount: number) => {
      if (amount < fonctionPro.minWithdrawalAmount) {
        return { success: false, message: `Le montant minimum de retrait est de ${fonctionPro.minWithdrawalAmount}€` };
      }
      return { success: true, message: `Votre demande de retrait de ${amount}€ a été traitée instantanément.` };
    },
    getChannelAnalytics: (_channelId: string | number) => {
      console.log(`Récupération des analytiques pour le canal ${_channelId}`);
      return {
        success: true,
        data: { views: 15420, uniqueVisitors: 8750, subscriptions: 430, revenue: 1250 }
      };
    }
  };

  const fonctionAdmin: UserFeatures = {
    ...fonctionPro,
    canManageUsers: true,
    canManageAllChannels: true,
    canModerateContent: true,
    canViewAllTransactions: true,
    canSetFeaturedChannels: true,
    canDeleteAnyMessage: true,
    canReactToMessages: true,
    maxAttachmentSize: 100,
    maxChannelsJoined: 1000,
    withdrawalFeePercentage: 0,
    minWithdrawalAmount: 1,
    withdrawalDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    withdrawalProcessingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    manageUser: (_userId: string | number, _action: string) => ({ success: true, message: `Action ${_action} effectuée sur l'utilisateur` }),
    moderateChannel: (_channelId: string | number, _action: string) => ({ success: true, message: `Canal ${_action} avec succès` }),
    setFeaturedChannel: (_channelId: string | number, featured: boolean) => ({ success: true, message: featured ? 'Canal mis en avant' : 'Canal retiré de la mise en avant' }),
    viewAllTransactions: () => ({ success: true, transactions: [] })
  };

  if (u?.role === 'admin') return fonctionAdmin;
  if (u?.isPro) return fonctionPro;
  return fonctionUser;
};
