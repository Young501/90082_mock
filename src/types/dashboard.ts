export interface DashboardStats {
    students: {
      invited: number;
      accepted: number;
      messaged: number;
      matched: number;
    };
    partners: {
      invited: number;
      accepted: number;
      messaged: number;
      matched: number;
    };
  }