import mitt from 'mitt'

type Events = {
  toggleLeftDrawer?: void;
  updateYearMonthHeader?: string;
  updateTeamHeader?: {
    cd: number,
    type: string,
    label: string
  };
}

export const emitter = mitt<Events>()
