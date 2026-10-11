import { createApp, logger } from './app';

const PORT = process.env.PORT_GATEWAY || process.env.PORT || 4000;
const app = createApp();

app.listen(PORT, () => {
  logger.info(`SkillGap Express Gateway listening on port ${PORT}`);
});
