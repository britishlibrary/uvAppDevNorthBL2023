import { IIIFEvents } from "../../IIIFEvents";
import { BaseExtension } from "../../modules/uv-shared-module/BaseExtension";
import { EbookLeftPanel } from "../../modules/uv-ebookleftpanel-module/EbookLeftPanel";
import { EbookExtensionEvents } from "./Events";
import { DownloadDialogue } from "./DownloadDialogue";
import { EbookCenterPanel } from "../../modules/uv-ebookcenterpanel-module/EbookCenterPanel";
import { FooterPanel } from "../../modules/uv-shared-module/FooterPanel";
import { FooterPanel as MobileFooterPanel } from "../../modules/uv-ebookmobilefooterpanel-module/MobileFooter";
import { HeaderPanel } from "../../modules/uv-shared-module/HeaderPanel";
import { IEbookExtension } from "./IEbookExtension";
import { MoreInfoDialogue } from "../../modules/uv-dialogues-module/MoreInfoDialogue";
import { MoreInfoRightPanel } from "../../modules/uv-moreinforightpanel-module/MoreInfoRightPanel";
import { SettingsDialogue } from "./SettingsDialogue";
import { ShareDialogue } from "./ShareDialogue";
import { IEbookExtensionData } from "./IEbookExtensionData";
import { Strings } from "@edsilv/utils";
import "./theme/theme.less";
import defaultConfig from "./config/en-GB.json";

export default class Extension extends BaseExtension
  implements IEbookExtension {
  $downloadDialogue: JQuery;
  $moreInfoDialogue: JQuery;
  $multiSelectDialogue: JQuery;
  $settingsDialogue: JQuery;
  $shareDialogue: JQuery;
  centerPanel: EbookCenterPanel;
  downloadDialogue: DownloadDialogue;
  footerPanel: FooterPanel;
  headerPanel: HeaderPanel;
  leftPanel: EbookLeftPanel;
  mobileFooterPanel: MobileFooterPanel;
  moreInfoDialogue: MoreInfoDialogue;
  rightPanel: MoreInfoRightPanel;
  settingsDialogue: SettingsDialogue;
  shareDialogue: ShareDialogue;
  cfiFragement: string;
  defaultConfig: any = defaultConfig;
  locales = {
    "en-GB": defaultConfig,
    "cy-GB": () => import("./config/cy-GB.json"),
    "fr-FR": () => import("./config/fr-FR.json"),
    "pl-PL": () => import("./config/pl-PL.json"),
    "sv-SE": () => import("./config/sv-SE.json"),
  };

  create(): void {
    super.create();

    this.extensionHost.subscribe(
      IIIFEvents.CANVAS_INDEX_CHANGE,
      (canvasIndex: number) => {
        this.viewCanvas(canvasIndex);
      }
    );

    this.extensionHost.subscribe(
      EbookExtensionEvents.CFI_FRAGMENT_CHANGE,
      (cfi: string) => {
        this.cfiFragement = cfi;
        this.fire(EbookExtensionEvents.CFI_FRAGMENT_CHANGE, this.cfiFragement);
      }
    );
  }

  createModules(): void {
    super.createModules();

    if (this.isHeaderPanelEnabled()) {
      this.headerPanel = new HeaderPanel(this.shell.$headerPanel);
    } else {
      this.shell.$headerPanel.hide();
    }

    if (this.isLeftPanelEnabled()) {
      this.leftPanel = new EbookLeftPanel(this.shell.$leftPanel);
    } else {
      this.shell.$leftPanel.hide();
    }

    this.centerPanel = new EbookCenterPanel(this.shell.$centerPanel);

    if (this.isRightPanelEnabled()) {
      this.rightPanel = new MoreInfoRightPanel(this.shell.$rightPanel);
    } else {
      this.shell.$rightPanel.hide();
    }

    if (this.isFooterPanelEnabled()) {
      this.footerPanel = new FooterPanel(this.shell.$footerPanel);
      this.mobileFooterPanel = new MobileFooterPanel(
        this.shell.$mobileFooterPanel
      );
    } else {
      this.shell.$footerPanel.hide();
    }

    this.$moreInfoDialogue = $(
      '<div class="overlay moreInfo" aria-hidden="true"></div>'
    );
    this.shell.$overlays.append(this.$moreInfoDialogue);
    this.moreInfoDialogue = new MoreInfoDialogue(this.$moreInfoDialogue);

    this.$shareDialogue = $(
      '<div class="overlay share" aria-hidden="true"></div>'
    );
    this.shell.$overlays.append(this.$shareDialogue);
    this.shareDialogue = new ShareDialogue(this.$shareDialogue);

    this.$downloadDialogue = $(
      '<div class="overlay download" aria-hidden="true" role="region"></div>'
    );
    this.shell.$overlays.append(this.$downloadDialogue);
    this.downloadDialogue = new DownloadDialogue(this.$downloadDialogue);

    this.$settingsDialogue = $(
      '<div class="overlay settings" aria-hidden="true"></div>'
    );
    this.shell.$overlays.append(this.$settingsDialogue);
    this.settingsDialogue = new SettingsDialogue(this.$settingsDialogue);

    if (this.isHeaderPanelEnabled()) {
      this.headerPanel.init();
    }

    if (this.isLeftPanelEnabled()) {
      this.leftPanel.init();
    }

    if (this.isRightPanelEnabled()) {
      this.rightPanel.init();
    }

    if (this.isFooterPanelEnabled()) {
      this.footerPanel.init();
    }
  }

  isLeftPanelEnabled(): boolean {
    return true;
  }

  render(): void {
    super.render();
    this.checkForCFIParam();
  }

  getEmbedScript(template: string, width: number, height: number): string {
    const appUri: string = this.getAppUri();
    const iframeSrc: string = `${appUri}#?manifest=${this.helper.manifestUri}&cfi=${this.cfiFragement}`;
    const script: string = Strings.format(
      template,
      iframeSrc,
      width.toString(),
      height.toString()
    );
    return script;
  }

  checkForCFIParam(): void {
    const cfi: string | null = (<IEbookExtensionData>this.data).cfi;

    if (cfi) {
      this.extensionHost.publish(EbookExtensionEvents.CFI_FRAGMENT_CHANGE, cfi);
    }
  }
}
