export function shouldShowUrlRequiredError(
  hasInteracted: boolean,
  urlValue: string
) {
  return hasInteracted && urlValue.trim().length === 0;
}
