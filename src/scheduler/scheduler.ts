import schedule from './schedule';
import { AppReloadJob } from './Jobs';
import { Scheduler } from './scheduler.types';

const scheduler: Scheduler = {
  $jobs: [],
  $start() {
    this.$jobs.forEach((j) => {
      ll('cancel');
      j.cancel();
    });
    this.$jobs = [];
    if (env.isNotLocal) {
      ll('job start');

      this.$jobs.push(
        schedule.dailyAt(
          Number(ifEmpty(process.env.PM2_RELOAD_HOUR, '5')),
          Number(ifEmpty(process.env.PM2_RELOAD_MINUTE, '0')),
          new AppReloadJob()
        )
      );
    }
  },
};

export default scheduler;
