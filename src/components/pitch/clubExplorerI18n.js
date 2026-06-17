import { SESSIONS, TASK_FRAMEWORKS } from "./clubExplorerData";

export function localizeSession(sessionId, t) {
  const s = SESSIONS[sessionId];
  if (!s) return null;
  const loc = t(`explorerUi.sessions.${sessionId}`, { returnObjects: true });
  return {
    ...s,
    day: loc?.day ?? s.day,
    framework: loc?.framework ?? s.framework,
    title: loc?.title ?? s.title,
    objective: loc?.objective ?? s.objective,
    blocks: s.blocks.map((block) => ({
      ...block,
      label: t(`explorerUi.blocks.${block.id}`, { defaultValue: block.label }),
      exercises: block.exercises.map((ex) => ({
        ...ex,
        name: t(`explorerUi.exercises.${ex.id}.name`, { defaultValue: ex.name }),
        desc: t(`explorerUi.exercises.${ex.id}.desc`, { defaultValue: ex.desc }),
      })),
    })),
  };
}

export function getMonthNames(t) {
  return t("explorerUi.months", { returnObjects: true });
}

export function getWeekdays(t) {
  return t("explorerUi.weekdays", { returnObjects: true });
}

export function localizeLoadLevel(level, t) {
  return t(`explorerUi.loadLevels.${level}`, { defaultValue: level });
}

export function localizeRating(rating, t) {
  return t(`explorerUi.ratings.${rating}`, { defaultValue: rating });
}

export function localizePlayerFoot(foot, t) {
  const map = { Right: "footRight", Left: "footLeft", Both: "footBoth" };
  return t(`explorerUi.playerFields.${map[foot] || "footRight"}`, { defaultValue: foot });
}

export function localizePlan(plan, t) {
  return plan === "Premium"
    ? t("explorerUi.playerFields.planPremium")
    : t("explorerUi.playerFields.planBasic");
}

export function getTaskFrameworks(t) {
  return TASK_FRAMEWORKS.map((f) => ({
    ...f,
    label: t(`explorerUi.frameworks.${f.fw}`, { defaultValue: f.label }),
    tasks: t(`explorerUi.tasks.${f.fw}`, { returnObjects: true }),
  }));
}

export function getTaskParams(fw, t) {
  return t(`explorerUi.taskParams.${fw}`, { returnObjects: true });
}

export function localizeLoadLabel(label, t) {
  if (label === "Match") return t("explorerUi.frameworks.M");
  return label;
}
