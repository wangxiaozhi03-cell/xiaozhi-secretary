import UIAbility from "@ohos:app.ability.UIAbility";
import type AbilityConstant from "@ohos:app.ability.AbilityConstant";
import type Want from "@ohos:app.ability.Want";
import hilog from "@ohos:hilog";
import type window from "@ohos:window";
export default class EntryAbility extends UIAbility {
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        hilog.info(0x0000, 'ImageTool', 'Ability onCreate');
    }
    onDestroy(): void {
        hilog.info(0x0000, 'ImageTool', 'Ability onDestroy');
    }
    onWindowStageCreate(windowStage: window.WindowStage): void {
        hilog.info(0x0000, 'ImageTool', 'Ability onWindowStageCreate');
        windowStage.loadContent('pages/Index', (err) => {
            if (err.code) {
                hilog.error(0x0000, 'ImageTool', 'Failed to load content. Cause: %{public}s', JSON.stringify(err));
                return;
            }
            hilog.info(0x0000, 'ImageTool', 'Succeeded in loading content.');
        });
    }
    onWindowStageDestroy(): void {
        hilog.info(0x0000, 'ImageTool', 'Ability onWindowStageDestroy');
    }
    onForeground(): void {
        hilog.info(0x0000, 'ImageTool', 'Ability onForeground');
    }
    onBackground(): void {
        hilog.info(0x0000, 'ImageTool', 'Ability onBackground');
    }
}
