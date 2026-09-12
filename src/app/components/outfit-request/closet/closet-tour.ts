import introJs from 'intro.js';
import { IntroStep, TooltipPosition } from 'intro.js/src/core/steps';
import { ClosetStateService } from './closet-state.service';

/** intro.js step plus the `data-step` key used to look the element up at runtime. */
interface ISkyIntroStep extends Partial<IntroStep> {
  sStep: number;
}

/**
 * `data-step` keys placed on the closet/request templates. Steps are ordered by
 * the array built below — these numbers only identify the target element.
 */
const S = {
  REQUEST: 0,
  ITEM: 1, ITEM_SECTION: 2, ITEM_COLOR: 3,
  COPY: 4, COPY_LINK: 5, COPY_IMAGE: 6,
  COPY_IMAGE_CLOSET: 7, COPY_IMAGE_REQUEST: 8, COPY_IMAGE_SQUARE: 9, COPY_IMAGE_TEMPLATE: 10,
  OPTIONS: 100, CLOSET_ITEMS: 101, CLOSET_MODIFY: 102,
  CLOSET_COLUMNS: 103, CLOSET_ONGOING: 104, CLOSET_SYNC: 105, CLOSET_DONE: 106,
  OPTION_SIZE: 122, OPTION_IAP: 123, OPTION_RESET: 124, OPTION_SHUFFLE: 125,
  OPTION_SEARCH: 126, OPTION_COST: 127, OPTION_BACKGROUND: 128,
  LINK_HOME: 904
};

export interface IClosetTourOptions {
  /** Element the tour searches for `[data-step]` targets. */
  root: HTMLElement;
  /** Request mode hides the closet-only steps. */
  requesting: boolean;
  state: ClosetStateService;
}

/** Starts the guided tour of the closet / outfit request page. */
export function startClosetTour(options: IClosetTourOptions): void {
  const { root, requesting, state } = options;

  // The tour tooltips assume the compact grid fits on screen.
  state.itemSize.set('small');

  const steps: Array<ISkyIntroStep> = [];

  steps.push(requesting
    ? { sStep: S.REQUEST, title: 'Closet', intro: 'If you are trying to share your closet instead of creating a request, please visit this page. The page you\'re on right now is meant only for creating requests.' }
    : { sStep: S.REQUEST, title: 'Request', intro: 'If you are trying to create a request instead of sharing your closet, please visit this page. Although you can create requests on this page it\'s meant for viewing or sharing your closet.' });

  steps.push(
    { sStep: S.ITEM, title: 'Sky cosmetics', intro: 'Here you can see all cosmetics from Sky. You can create a request simply by clicking the icons to select them.' },
    { sStep: S.ITEM_SECTION, title: 'Closets', intro: 'Each closet is organized as it appears in Sky. You can select items here. Cosmetics that can be dyed have palette icons below them which you can click on.' },
    { sStep: S.ITEM_COLOR, title: 'Selection color', intro: 'If you want to select items with different colors you can click here. Use this when marking alternative items or when you want to see multiple outfits in one request.' },
    { sStep: S.COPY, title: 'Share request', intro: 'When you are done selecting items you can share your request.' },
    { sStep: S.COPY_LINK, title: 'Copy link', intro: 'A shareable link will be copied to your clipboard. You can paste this link in Discord. The link allows other players to easily see if they have the items for your request and lasts 1 week.' },
    { sStep: S.COPY_IMAGE, title: 'Share image', intro: 'There are multiple options available when sharing an image.' }
  );

  if (!requesting) {
    steps.push({ sStep: S.COPY_IMAGE_CLOSET, title: 'Share closet', intro: 'Sharing your closet will hide items you do not own. This can be useful when asking for outfit suggestions or when opening your closet for requests.' });
  }
  steps.push({ sStep: S.COPY_IMAGE_REQUEST, title: 'Share full request', intro: 'Sharing a full request will hide items you haven\'t selected on the full template. This can be useful when requesting one or multiple outfits.' });
  steps.push({ sStep: S.COPY_IMAGE_SQUARE, title: 'Share fit request', intro: 'Sharing a fit request will create a smaller square with just the icons of one outfit.' });
  if (!requesting) {
    steps.push({ sStep: S.COPY_IMAGE_TEMPLATE, title: 'Share template', intro: 'Sharing the template will show all items.' });
  }

  steps.push({ sStep: S.OPTIONS, title: 'Options', intro: 'Various options to change what\'s displayed can be found here.' });

  if (!requesting) {
    steps.push(
      { sStep: S.CLOSET_ITEMS, title: 'Show items', intro: 'You can switch between showing all items or only the items you own.' },
      { sStep: S.CLOSET_MODIFY, title: 'Modify closet', intro: 'To change the items shown in your closet you can modify your closet here. In the next steps we\'ll go over these options.' },
      { sStep: S.CLOSET_COLUMNS, title: 'Closet columns', intro: 'Depending on your device and orientation Sky will show a number of items in your closet per row. You can select that number here to make this page match Sky.' },
      { sStep: S.CLOSET_ONGOING, title: 'Ongoing items', intro: 'In Sky it is possible to preview items from the ongoing season and event. By enabling this option these items will still be visible (slightly darkened) when showing only your items.' },
      { sStep: S.CLOSET_SYNC, title: 'Sync closet', intro: 'If you look at the rest of this website you\'ll be able to find spirit trees and IAPs. These can be used to keep track of your unlocked items. If you keep track of your progress this way you can sync this closet page to use that progress.' },
      { sStep: S.CLOSET_SYNC, title: 'Pick your items', intro: 'You can also choose to toggle items by clicking on them in the grid below while this \'Modify closet\' panel is open.' },
      { sStep: S.CLOSET_DONE, title: 'Done', intro: 'When you\'re done modifying your closet you can close the panel here.', disableInteraction: true }
    );
  }

  steps.push({ sStep: S.OPTION_SIZE, title: 'Icon size', intro: 'Switch between showing small and large item icons.' });
  if (!requesting) {
    steps.push({ sStep: S.OPTION_IAP, title: 'In-app purchases', intro: 'Show or hide items that cost real money. The icons will appear darker when you hide them.' });
  }
  steps.push(
    { sStep: S.OPTION_BACKGROUND, title: 'Background', intro: 'Pick the background used for the images you share from this page.' },
    { sStep: S.OPTION_RESET, title: 'Reset', intro: 'Remove all items you\'ve selected.' },
    { sStep: S.OPTION_SHUFFLE, title: 'Shuffle', intro: 'Remove all items you\'ve selected and select one random item from each closet.' },
    { sStep: S.OPTION_COST, title: 'Costs', intro: 'Calculate what the items in your selection cost in total.' },
    { sStep: S.OPTION_SEARCH, title: 'Search', intro: 'You can search for items here. Matching items will have a purple border. Item names often include the spirit name, for example \'Spinning Mentor Cape\'.' }
  );

  if (requesting) {
    steps.push({ sStep: S.LINK_HOME, title: 'Home', intro: 'This button will take you to the home page of the Sky Planner website.' });
  }

  steps.forEach((step, i) => { step.step = i + 1; }); // Assign step order from array.

  // Targets are resolved per step rather than up front: the panels the tour opens
  // along the way (image picker, modify panel, background picker) aren't in the
  // DOM until their step arrives.
  const retarget = (step: ISkyIntroStep): void => {
    const el = root.querySelector('[data-step="' + step.sStep + '"]') as HTMLElement | null;
    if (!el) { return; }
    step.element = el;
    step.position = (el.dataset['position'] as TooltipPosition) || 'bottom-left-aligned';
  };

  setTimeout(() => {
    const intro = introJs(document.body).setOptions({
      scrollTo: 'tooltip',
      steps, showBullets: false, autoPosition: false
    });

    intro.onbeforechange(function(this: any) {
      const step = this._introItems[this._currentStep] as ISkyIntroStep;
      if (!step) { return true; }

      if (step.sStep === S.ITEM_SECTION) {
        const container = root.querySelector('.atmos-closet-container') as HTMLElement | null;
        if (container) { container.scrollLeft = 0; }
      }

      const inImagePicker = step.sStep >= S.COPY_IMAGE_CLOSET && step.sStep <= S.COPY_IMAGE_TEMPLATE;
      state.showingImagePicker.set(inImagePicker);

      const inModifyPanel = step.sStep > S.CLOSET_MODIFY && step.sStep <= S.CLOSET_DONE;
      if (inModifyPanel) { state.closetMode.set('closet'); }
      state.modifyingCloset.set(inModifyPanel);

      state.showingBackgroundPicker.set(step.sStep === S.OPTION_BACKGROUND);

      // Let the side effects above render before the step is positioned.
      return new Promise<boolean>(res => setTimeout(() => { retarget(step); res(true); }, 0));
    });

    intro.onexit(() => {
      state.showingImagePicker.set(false);
      state.showingBackgroundPicker.set(false);
      state.modifyingCloset.set(false);
    });

    intro.start();
  });
}
