(self["webpackChunkSkyGame_Planner"] = self["webpackChunkSkyGame_Planner"] || []).push([["main"],{

/***/ 158:
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AppRoutingModule": () => (/* binding */ AppRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _components_credits_credits_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/credits/credits.component */ 5884);
/* harmony import */ var _components_event_instance_event_instance_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/event-instance/event-instance.component */ 9563);
/* harmony import */ var _components_event_event_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/event/event.component */ 4572);
/* harmony import */ var _components_events_events_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/events/events.component */ 9711);
/* harmony import */ var _components_items_items_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/items/items.component */ 9965);
/* harmony import */ var _components_realms_realms_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/realms/realms.component */ 5712);
/* harmony import */ var _components_season_season_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/season/season.component */ 8229);
/* harmony import */ var _components_seasons_seasons_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/seasons/seasons.component */ 5551);
/* harmony import */ var _components_spirit_spirit_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/spirit/spirit.component */ 8540);
/* harmony import */ var _components_spirits_spirits_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/spirits/spirits.component */ 7912);
/* harmony import */ var _components_traveling_spirits_traveling_spirits_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/traveling-spirits/traveling-spirits.component */ 1542);
/* harmony import */ var _components_shops_shops_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/shops/shops.component */ 3975);
/* harmony import */ var _components_wing_buffs_wing_buffs_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/wing-buffs/wing-buffs.component */ 6837);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/core */ 2560);
















const title = title => `${title} - Sky Planner`;
const routes = [{
  path: '',
  redirectTo: 'realm',
  pathMatch: 'full'
}, {
  path: 'credits',
  component: _components_credits_credits_component__WEBPACK_IMPORTED_MODULE_0__.CreditsComponent,
  title: title('Credits')
}, {
  path: 'event',
  component: _components_events_events_component__WEBPACK_IMPORTED_MODULE_3__.EventsComponent,
  title: title('Events')
}, {
  path: 'event/:guid',
  component: _components_event_event_component__WEBPACK_IMPORTED_MODULE_2__.EventComponent,
  title: title('Event')
}, {
  path: 'event-instance/:guid',
  component: _components_event_instance_event_instance_component__WEBPACK_IMPORTED_MODULE_1__.EventInstanceComponent,
  title: title('Event')
}, {
  path: 'item',
  component: _components_items_items_component__WEBPACK_IMPORTED_MODULE_4__.ItemsComponent,
  title: title('Items')
}, {
  path: 'realm',
  component: _components_realms_realms_component__WEBPACK_IMPORTED_MODULE_5__.RealmsComponent,
  title: title('Realms')
}, {
  path: 'season',
  component: _components_seasons_seasons_component__WEBPACK_IMPORTED_MODULE_7__.SeasonsComponent,
  title: title('Seasons')
}, {
  path: 'season/:guid',
  component: _components_season_season_component__WEBPACK_IMPORTED_MODULE_6__.SeasonComponent,
  title: title('Season')
}, {
  path: 'shop',
  component: _components_shops_shops_component__WEBPACK_IMPORTED_MODULE_11__.ShopsComponent,
  title: title('Shops')
}, {
  path: 'spirit',
  component: _components_spirits_spirits_component__WEBPACK_IMPORTED_MODULE_9__.SpiritsComponent,
  title: title('Spirits')
}, {
  path: 'spirit/:guid',
  component: _components_spirit_spirit_component__WEBPACK_IMPORTED_MODULE_8__.SpiritComponent,
  title: title('Spirit')
}, {
  path: 'ts',
  component: _components_traveling_spirits_traveling_spirits_component__WEBPACK_IMPORTED_MODULE_10__.TravelingSpiritsComponent,
  title: title('Traveling Spirits')
}, {
  path: 'wing-buffs',
  component: _components_wing_buffs_wing_buffs_component__WEBPACK_IMPORTED_MODULE_12__.WingBuffsComponent,
  title: title('Wing Buffs')
}, {
  path: 'editor',
  loadChildren: () => __webpack_require__.e(/*! import() */ "src_app_editor_editor_module_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./editor/editor.module */ 3164)).then(m => m.EditorModule)
}];
class AppRoutingModule {}
AppRoutingModule.ɵfac = function AppRoutingModule_Factory(t) {
  return new (t || AppRoutingModule)();
};
AppRoutingModule.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_13__["ɵɵdefineNgModule"]({
  type: AppRoutingModule
});
AppRoutingModule.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_13__["ɵɵdefineInjector"]({
  imports: [_angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled'
  }), _angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule]
});
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_13__["ɵɵsetNgModuleScope"](AppRoutingModule, {
    imports: [_angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule],
    exports: [_angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule]
  });
})();

/***/ }),

/***/ 5041:
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AppComponent": () => (/* binding */ AppComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _services_data_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./services/data.service */ 2468);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/platform-browser */ 4497);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _components_menu_menu_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/menu/menu.component */ 5819);
/* harmony import */ var _components_status_bar_status_bar_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/status-bar/status-bar.component */ 2592);








function AppComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "mat-icon", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
}
function AppComponent_ng_container_1_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 6)(1, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2, "Data was changed in another tab. Please refresh this tab to avoid losing changes!");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
}
function AppComponent_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "app-menu");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, AppComponent_ng_container_1_div_2_Template, 3, 0, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](4, "router-outlet")(5, "app-status-bar");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r1.dataLoss);
  }
}
class AppComponent {
  constructor(_dataService, _domSanitizer, _matIconRegistry) {
    this._dataService = _dataService;
    this._domSanitizer = _domSanitizer;
    this._matIconRegistry = _matIconRegistry;
    this.ready = false;
    this.dataLoss = false;
    this._dataService.onData.subscribe(() => {
      this.onData();
    });
    _matIconRegistry.addSvgIconSet(_domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icons.svg'));
    window.addEventListener('storage', () => {
      this.dataLoss = true;
    });
  }
  onData() {
    this.ready = true;
    document.addEventListener('keydown', event => {
      if (event.ctrlKey && event.shiftKey && event.key.toUpperCase() === 'F') {
        event.preventDefault();
        // TODO: Search page.
      }
    });
  }
}

AppComponent.ɵfac = function AppComponent_Factory(t) {
  return new (t || AppComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_data_service__WEBPACK_IMPORTED_MODULE_0__.DataService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_platform_browser__WEBPACK_IMPORTED_MODULE_4__.DomSanitizer), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_material_icon__WEBPACK_IMPORTED_MODULE_5__.MatIconRegistry));
};
AppComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
  type: AppComponent,
  selectors: [["app-root"]],
  decls: 2,
  vars: 2,
  consts: [["class", "loading fade-in", 4, "ngIf"], [4, "ngIf"], [1, "loading", "fade-in"], ["fontIcon", "cached", 1, "spin"], ["class", "data-loss", 4, "ngIf"], [1, "content"], [1, "data-loss"], [1, "data-loss-inner"]],
  template: function AppComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](0, AppComponent_div_0_Template, 2, 0, "div", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, AppComponent_ng_container_1_Template, 6, 1, "ng-container", 1);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", !ctx.ready);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.ready);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_7__.RouterOutlet, _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__.MatIcon, _components_menu_menu_component__WEBPACK_IMPORTED_MODULE_1__.MenuComponent, _components_status_bar_status_bar_component__WEBPACK_IMPORTED_MODULE_2__.StatusBarComponent],
  styles: [".loading[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100%;\n  transform: scaleX(-1);\n}\n.loading[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  scale: 3;\n}\n@keyframes _ngcontent-%COMP%_spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(-360deg);\n  }\n}\n.loading[_ngcontent-%COMP%]   .spin[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_spin 2s linear infinite;\n}\n@keyframes _ngcontent-%COMP%_fade-in {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.fade-in[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_fade-in 2s ease-in;\n  animation-fill-mode: forwards;\n}\n  body {\n  position: relative;\n  left: var(--menu-width);\n  margin-bottom: var(--status-height);\n  width: calc(100% - var(--menu-width));\n  padding: var(--padding-content);\n}\napp-status-bar[_ngcontent-%COMP%] {\n  display: block;\n  position: fixed;\n  z-index: 50;\n  bottom: 0;\n  left: var(--menu-width);\n  right: 0;\n  padding: 0px var(--padding-content);\n  background: var(--color-status-background);\n  height: var(--status-height);\n}\n.data-loss[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: #0008;\n  z-index: 999;\n}\n.data-loss-inner[_ngcontent-%COMP%] {\n  position: relative;\n  display: inline-block;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvYXBwLmNvbXBvbmVudC5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsZUFBQTtFQUNBLE1BQUE7RUFBUSxRQUFBO0VBQVUsU0FBQTtFQUFXLE9BQUE7RUFDN0IsYUFBQTtFQUNBLHVCQUFBO0VBQ0EsbUJBQUE7RUFDQSxZQUFBO0VBQ0EscUJBQUE7QUFJRjtBQVhBO0VBVUksUUFBQTtBQUlKO0FBREU7RUFDRTtJQUFNLHVCQUFBO0VBSVI7RUFIRTtJQUFJLDBCQUFBO0VBTU47QUFDRjtBQXRCQTtFQW1CSSxrQ0FBQTtBQU1KO0FBRkE7RUFDRTtJQUFPLFVBQUE7RUFLUDtFQUpBO0lBQUssVUFBQTtFQU9MO0FBQ0Y7QUFMQTtFQUNFLDZCQUFBO0VBQ0EsNkJBQUE7QUFPRjtBQUpBO0VBQ0Usa0JBQUE7RUFDQSx1QkFBQTtFQUNBLG1DQUFBO0VBQ0EscUNBQUE7RUFFQSwrQkFBQTtBQUtGO0FBRkE7RUFDRSxjQUFBO0VBQ0EsZUFBQTtFQUNBLFdBQUE7RUFDQSxTQUFBO0VBQ0EsdUJBQUE7RUFDQSxRQUFBO0VBQ0EsbUNBQUE7RUFDQSwwQ0FBQTtFQUNBLDRCQUFBO0FBSUY7QUFBQTtFQUNFLGVBQUE7RUFDQSxNQUFBO0VBQ0EsT0FBQTtFQUNBLFFBQUE7RUFDQSxTQUFBO0VBQ0EsdUJBQUE7RUFDQSxZQUFBO0FBRUY7QUFDQTtFQUNFLGtCQUFBO0VBQ0EscUJBQUE7RUFDQSxRQUFBO0VBQ0EsU0FBQTtFQUNBLGdDQUFBO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIubG9hZGluZyB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgdG9wOiAwOyByaWdodDogMDsgYm90dG9tOiAwOyBsZWZ0OiAwO1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgaGVpZ2h0OiAxMDAlO1xuICB0cmFuc2Zvcm06IHNjYWxlWCgtMSk7XG5cbiAgbWF0LWljb24ge1xuICAgIHNjYWxlOiAzO1xuICB9XG5cbiAgQGtleWZyYW1lcyBzcGluIHtcbiAgICBmcm9tIHt0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTt9XG4gICAgdG8ge3RyYW5zZm9ybTogcm90YXRlKC0zNjBkZWcpO31cbiAgfVxuXG4gIC5zcGluIHtcbiAgICBhbmltYXRpb246IHNwaW4gMnMgbGluZWFyIGluZmluaXRlO1xuICB9XG59XG5cbkBrZXlmcmFtZXMgZmFkZS1pbiB7XG4gIGZyb20geyBvcGFjaXR5OiAwOyB9XG4gIHRvIHsgb3BhY2l0eTogMTsgfVxufVxuXG4uZmFkZS1pbiB7XG4gIGFuaW1hdGlvbjogZmFkZS1pbiAycyBlYXNlLWluO1xuICBhbmltYXRpb24tZmlsbC1tb2RlOiBmb3J3YXJkcztcbn1cblxuOjpuZy1kZWVwIGJvZHkge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGxlZnQ6IHZhcigtLW1lbnUtd2lkdGgpO1xuICBtYXJnaW4tYm90dG9tOiB2YXIoLS1zdGF0dXMtaGVpZ2h0KTtcbiAgd2lkdGg6IGNhbGMoMTAwJSAtIHZhcigtLW1lbnUtd2lkdGgpKTtcbiAgLy9oZWlnaHQ6IGNhbGMoMTAwJSAtIHZhcigtLXN0YXR1cy1oZWlnaHQpKTtcbiAgcGFkZGluZzogdmFyKC0tcGFkZGluZy1jb250ZW50KTtcbn1cblxuYXBwLXN0YXR1cy1iYXIge1xuICBkaXNwbGF5OiBibG9jaztcbiAgcG9zaXRpb246IGZpeGVkO1xuICB6LWluZGV4OiA1MDtcbiAgYm90dG9tOiAwO1xuICBsZWZ0OiB2YXIoLS1tZW51LXdpZHRoKTtcbiAgcmlnaHQ6IDA7XG4gIHBhZGRpbmc6IDBweCB2YXIoLS1wYWRkaW5nLWNvbnRlbnQpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvci1zdGF0dXMtYmFja2dyb3VuZCk7XG4gIGhlaWdodDogdmFyKC0tc3RhdHVzLWhlaWdodCk7XG4gIC8vIGJvcmRlci10b3A6IDFweCBzb2xpZCAjMjIyMjMwO1xufVxuXG4uZGF0YS1sb3NzIHtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB0b3A6IDA7XG4gIGxlZnQ6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIGJhY2tncm91bmQtY29sb3I6ICMwMDA4O1xuICB6LWluZGV4OiA5OTk7XG59XG5cbi5kYXRhLWxvc3MtaW5uZXIge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgdG9wOiA1MCU7XG4gIGxlZnQ6IDUwJTtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
});

/***/ }),

/***/ 6747:
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AppModule": () => (/* binding */ AppModule)
/* harmony export */ });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @angular/common/http */ 8987);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @angular/platform-browser */ 4497);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! @angular/cdk/layout */ 3278);
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app-routing.module */ 158);
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app.component */ 5041);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _components_spirit_tree_spirit_tree_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/spirit-tree/spirit-tree.component */ 5985);
/* harmony import */ var _components_node_node_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/node/node.component */ 4893);
/* harmony import */ var _components_item_item_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/item/item.component */ 9348);
/* harmony import */ var _components_menu_menu_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/menu/menu.component */ 5819);
/* harmony import */ var _components_seasons_seasons_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/seasons/seasons.component */ 5551);
/* harmony import */ var _components_traveling_spirits_traveling_spirits_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/traveling-spirits/traveling-spirits.component */ 1542);
/* harmony import */ var _components_realms_realms_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/realms/realms.component */ 5712);
/* harmony import */ var _components_icon_icon_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/icon/icon.component */ 5019);
/* harmony import */ var _components_status_bar_status_bar_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/status-bar/status-bar.component */ 2592);
/* harmony import */ var _components_credits_credits_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/credits/credits.component */ 5884);
/* harmony import */ var _components_items_items_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/items/items.component */ 9965);
/* harmony import */ var _components_table_table_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./components/table/table.component */ 9767);
/* harmony import */ var _components_table_table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./components/table/table-column/table-column.directive */ 4085);
/* harmony import */ var _components_events_events_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./components/events/events.component */ 9711);
/* harmony import */ var _components_spirits_spirits_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./components/spirits/spirits.component */ 7912);
/* harmony import */ var _components_table_table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./components/table/table-column/table-header.directive */ 7397);
/* harmony import */ var _components_table_table_column_table_footer_directive__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./components/table/table-column/table-footer.directive */ 1964);
/* harmony import */ var _components_spirit_spirit_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./components/spirit/spirit.component */ 8540);
/* harmony import */ var _components_season_season_component__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./components/season/season.component */ 8229);
/* harmony import */ var _components_event_event_component__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./components/event/event.component */ 4572);
/* harmony import */ var _components_event_instance_event_instance_component__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./components/event-instance/event-instance.component */ 9563);
/* harmony import */ var _components_shops_shops_component__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./components/shops/shops.component */ 3975);
/* harmony import */ var _components_wing_buffs_wing_buffs_component__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./components/wing-buffs/wing-buffs.component */ 6837);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @angular/core */ 2560);































class AppModule {}
AppModule.ɵfac = function AppModule_Factory(t) {
  return new (t || AppModule)();
};
AppModule.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_25__["ɵɵdefineNgModule"]({
  type: AppModule,
  bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_1__.AppComponent]
});
AppModule.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_25__["ɵɵdefineInjector"]({
  imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_26__.BrowserModule, _app_routing_module__WEBPACK_IMPORTED_MODULE_0__.AppRoutingModule, _angular_common_http__WEBPACK_IMPORTED_MODULE_27__.HttpClientModule, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_28__.NgbModule, _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_29__.LayoutModule, _angular_material_icon__WEBPACK_IMPORTED_MODULE_30__.MatIconModule]
});
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_25__["ɵɵsetNgModuleScope"](AppModule, {
    declarations: [_app_component__WEBPACK_IMPORTED_MODULE_1__.AppComponent, _components_spirit_tree_spirit_tree_component__WEBPACK_IMPORTED_MODULE_2__.SpiritTreeComponent, _components_node_node_component__WEBPACK_IMPORTED_MODULE_3__.NodeComponent, _components_item_item_component__WEBPACK_IMPORTED_MODULE_4__.ItemComponent, _components_menu_menu_component__WEBPACK_IMPORTED_MODULE_5__.MenuComponent, _components_seasons_seasons_component__WEBPACK_IMPORTED_MODULE_6__.SeasonsComponent, _components_traveling_spirits_traveling_spirits_component__WEBPACK_IMPORTED_MODULE_7__.TravelingSpiritsComponent, _components_realms_realms_component__WEBPACK_IMPORTED_MODULE_8__.RealmsComponent, _components_icon_icon_component__WEBPACK_IMPORTED_MODULE_9__.IconComponent, _components_status_bar_status_bar_component__WEBPACK_IMPORTED_MODULE_10__.StatusBarComponent, _components_credits_credits_component__WEBPACK_IMPORTED_MODULE_11__.CreditsComponent, _components_items_items_component__WEBPACK_IMPORTED_MODULE_12__.ItemsComponent, _components_table_table_component__WEBPACK_IMPORTED_MODULE_13__.TableComponent, _components_table_table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_14__.TableColumnDirective, _components_table_table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_17__.TableHeaderDirective, _components_table_table_column_table_footer_directive__WEBPACK_IMPORTED_MODULE_18__.TableFooterDirective, _components_events_events_component__WEBPACK_IMPORTED_MODULE_15__.EventsComponent, _components_spirits_spirits_component__WEBPACK_IMPORTED_MODULE_16__.SpiritsComponent, _components_spirit_spirit_component__WEBPACK_IMPORTED_MODULE_19__.SpiritComponent, _components_season_season_component__WEBPACK_IMPORTED_MODULE_20__.SeasonComponent, _components_event_event_component__WEBPACK_IMPORTED_MODULE_21__.EventComponent, _components_event_instance_event_instance_component__WEBPACK_IMPORTED_MODULE_22__.EventInstanceComponent, _components_shops_shops_component__WEBPACK_IMPORTED_MODULE_23__.ShopsComponent, _components_wing_buffs_wing_buffs_component__WEBPACK_IMPORTED_MODULE_24__.WingBuffsComponent],
    imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_26__.BrowserModule, _app_routing_module__WEBPACK_IMPORTED_MODULE_0__.AppRoutingModule, _angular_common_http__WEBPACK_IMPORTED_MODULE_27__.HttpClientModule, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_28__.NgbModule, _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_29__.LayoutModule, _angular_material_icon__WEBPACK_IMPORTED_MODULE_30__.MatIconModule]
  });
})();

/***/ }),

/***/ 5884:
/*!*********************************************************!*\
  !*** ./src/app/components/credits/credits.component.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CreditsComponent": () => (/* binding */ CreditsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/icon */ 7822);


class CreditsComponent {}
CreditsComponent.ɵfac = function CreditsComponent_Factory(t) {
  return new (t || CreditsComponent)();
};
CreditsComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
  type: CreditsComponent,
  selectors: [["app-credits"]],
  decls: 80,
  vars: 0,
  consts: [[1, "h2"], [1, "card-container"], [1, "h3"], ["fontIcon", "note"], [1, "card-container-inner"], ["href", "https://github.com/Silverfeelin/SkyGame-Planner/", "target", "_blank"], ["href", "https://github.com/Silverfeelin/SkyGame-Planner/blob/master/LICENSE", "target", "_blank"], ["href", "https://www.thatskygame.com/", "target", "_blank"], ["href", "https://thatgamecompany.com/", "target", "_blank"], [1, "card-container-inner", "mt-2"], [1, "ws-pl"], ["href", "https://github.com/Silverfeelin/SkyGame-Planner/blob/master/package.json", "target", "_blank"], ["href", "https://www.npmjs.com/", "target", "_blank"], [1, "card-container", "mt-2"], ["fontIcon", "favorite"], ["href", "https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki", "target", "_blank"], ["href", "https://www.fandom.com/licensing", "target", "_blank"], ["href", "https://www.youtube.com/channel/UCTdBaJiejXA0WSOkPX0YO0w", "target", "_blank"], ["href", "https://www.youtube.com/@noobmode", "target", "_blank"], ["href", "https://www.youtube.com/@AppUnwrapper", "target", "_blank"], ["href", "https://www.youtube.com/@SkyBat", "target", "_blank"]],
  template: function CreditsComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "Credits");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 1)(3, "h2", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](4, "mat-icon", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, " License ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div", 4)(7, "div")(8, "p");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](9, " Source code is publicly available ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "a", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](11, "on GitHub");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](12, " under the ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "a", 6);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](14, "MIT License");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](15, ". ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](16, "p");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](17, " This project hosts some media and screenshots captured from the game ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "a", 7);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](19, "Sky: Children of the Light");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](20, " developed by ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](21, "a", 8);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](22, "thatgamecompany");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](23, ".");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](24, "br");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](25, " Aforementioned license covers which assets are excluded from the terms of the license. ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](26, "p");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](27, " Sky Planner is non-commercial and is made available for informational purposes. ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](28, "div", 9)(29, "div", 10);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](30, " This project uses many public packages. These are listed in the ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](31, "a", 11);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](32, "package.json");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](33, " file.");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](34, "br");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](35, " For respective licenses, please look up the packages on ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](36, "a", 12);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](37, "npm");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](38, ". ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](39, "div", 13)(40, "h2", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](41, "mat-icon", 14);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](42, " Attribution ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](43, "div", 4)(44, "div", 10)(45, "p");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](46, " Various assets such as icons are loaded directly from the ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](47, "a", 15);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](48, "Sky:CotL Fandom wiki");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](49, ". ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](50, "p");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](51, " This project only ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](52, "i");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](53, "links");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](54, " to these original assets. For more information refer to ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](55, "a", 16);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](56, "Fandom licensing page");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](57, ".");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](58, "br");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](59, " In particular many icons from the wiki are contributed to the wiki by Morybel#0146, Mimi#4117 and ray808080#6797. ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](60, "div", 9)(61, "div", 10);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](62, " Some Traveling Spirit price corrections were made based on infographics by Jed#9275. ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](63, "div", 9)(64, "div", 10);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](65, " Some YouTube videos by ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](66, "a", 17);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](67, "nastymold");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](68, ", ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](69, "a", 18);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](70, "Noob Mode");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](71, ", ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](72, "a", 19);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](73, "App Unwrapper");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](74, " and ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](75, "a", 20);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](76, "Sky Bat");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](77, " were used as a reference to find missing information for older events.");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](78, "br");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](79, " Go check out their content! ");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()()();
    }
  },
  dependencies: [_angular_material_icon__WEBPACK_IMPORTED_MODULE_1__.MatIcon],
  styles: ["\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZVJvb3QiOiIifQ== */"]
});

/***/ }),

/***/ 9563:
/*!***********************************************************************!*\
  !*** ./src/app/components/event-instance/event-instance.component.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventInstanceComponent": () => (/* binding */ EventInstanceComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var src_app_services_debug_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/debug.service */ 3631);
/* harmony import */ var src_app_services_event_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/event.service */ 9426);
/* harmony import */ var src_app_services_iap_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/iap.service */ 5699);
/* harmony import */ var src_app_services_storage_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/services/storage.service */ 1188);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _spirit_tree_spirit_tree_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../spirit-tree/spirit-tree.component */ 5985);
/* harmony import */ var _item_item_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../item/item.component */ 9348);












function EventInstanceComponent_ng_container_5_div_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](1, "app-spirit-tree", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const spirit_r3 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("tree", spirit_r3.tree)("name", (spirit_r3 == null ? null : spirit_r3.name) || spirit_r3.spirit.name);
  }
}
function EventInstanceComponent_ng_container_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "div", 3)(2, "h2", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](3, "Spirits");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "div", 5)(5, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](6, EventInstanceComponent_ng_container_5_div_6_Template, 2, 2, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", ctx_r0.instance.spirits);
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_span_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1, "Returning IAP");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_span_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1, "New IAP");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_span_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const shop_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](shop_r5.name);
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_span_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1, "Premium Candle Store");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_span_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const shop_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3).$implicit;
    let tmp_0_0;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"]((tmp_0_0 = shop_r5.name) !== null && tmp_0_0 !== undefined ? tmp_0_0 : shop_r5.spirit == null ? null : shop_r5.spirit.name);
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_18_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](1, "mat-icon", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "span", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const iap_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngbTooltip", "Regular candles");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", iap_r8.c, " ");
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_18_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](1, "mat-icon", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "span", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const iap_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngbTooltip", "Season candles");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", iap_r8.sc, " ");
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_18_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](1, "mat-icon", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "span", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const iap_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngbTooltip", "Gift Season Pass");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", iap_r8.sp, " ");
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_18_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](1, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_18_ng_container_1_Template, 4, 2, "ng-container", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](2, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_18_ng_container_2_Template, 4, 2, "ng-container", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_18_ng_container_3_Template, 4, 2, "ng-container", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const iap_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", iap_r8.c);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", iap_r8.sc);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", iap_r8.sp);
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_20_ng_template_3_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "span", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const item_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](item_r25.name);
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_20_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](0, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_20_ng_template_3_ng_container_0_Template, 3, 1, "ng-container", 2);
  }
  if (rf & 2) {
    const item_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", item_r25);
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r33 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_20_Template_div_click_0_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r33);
      const iap_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
      const ctx_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](4);
      return _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵresetView"](ctx_r31.togglePurchased($event, iap_r8));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](1, "app-item", 31)(2, "mat-icon", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_20_ng_template_3_Template, 1, 1, "ng-template", null, 33, _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const item_r25 = ctx.$implicit;
    const _r26 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵreference"](4);
    const iap_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("item", item_r25)("ngbTooltip", _r26);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("unlocked", iap_r8.bought || (item_r25 == null ? null : item_r25.unlocked))("self", iap_r8.bought);
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 13)(1, "h3", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](4, "mat-icon", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "span", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](6, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_span_6_Template, 2, 0, "span", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](7, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_span_7_Template, 2, 0, "span", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](9, "mat-icon", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "span", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](11, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_span_11_Template, 2, 1, "span", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](12, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_span_12_Template, 2, 0, "span", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](13, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_span_13_Template, 2, 1, "span", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](15, "mat-icon", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](16, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](18, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_18_Template, 4, 3, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](19, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](20, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_div_20_Template, 5, 6, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const iap_r8 = ctx.$implicit;
    const shop_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2).$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngbTooltip", iap_r8.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", ctx_r7.iapNames[iap_r8.guid], " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("fontIcon", iap_r8.returning ? "undo" : "grade");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", iap_r8.returning);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", !iap_r8.returning);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("fontIcon", "location_on");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", shop_r5.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", !shop_r5.name && shop_r5.type === "Store");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", !shop_r5.name && shop_r5.type !== "Store");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngbTooltip", "Price of the IAP in USD.");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", iap_r8.price, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", iap_r8.c || iap_r8.sc || iap_r8.sp);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", iap_r8.items);
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](1, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_div_1_Template, 21, 13, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const shop_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", shop_r5.iaps);
  }
}
function EventInstanceComponent_ng_container_6_ng_container_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](1, EventInstanceComponent_ng_container_6_ng_container_5_ng_container_1_Template, 2, 1, "ng-container", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const shop_r5 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", shop_r5.iaps == null ? null : shop_r5.iaps.length);
  }
}
function EventInstanceComponent_ng_container_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "div", 3)(2, "h2", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](3, "In-App Purchases");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](5, EventInstanceComponent_ng_container_6_ng_container_5_Template, 2, 1, "ng-container", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", ctx_r1.shops);
  }
}
class EventInstanceComponent {
  constructor(_dataService, _debugService, _eventService, _iapService, _storageService, _route) {
    this._dataService = _dataService;
    this._debugService = _debugService;
    this._eventService = _eventService;
    this._iapService = _iapService;
    this._storageService = _storageService;
    this._route = _route;
    this.iapNames = {};
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }
  onParamsChanged(params) {
    const guid = params.get('guid');
    this.instance = this._dataService.guidMap.get(guid);
    this.shops = this.instance.shops ? [...this.instance.shops] : undefined;
    // Sort shops to prioritize ones with new items.
    this.shops?.sort((a, b) => {
      const aNew = a.iaps?.filter(iap => !iap.returning).length ?? 0;
      const bNew = b.iaps?.filter(iap => !iap.returning).length ?? 0;
      return bNew - aNew;
    });
    // Loop over all IAPs
    const eventName = this.instance.event?.name;
    if (eventName) {
      this.shops?.forEach(shop => {
        shop.iaps?.forEach(iap => {
          // Remove event name from IAP to save space.
          let name = iap.name?.replace(`${eventName} `, '');
          // Keep event name if a single word is left.
          if (name?.indexOf(' ') === -1) {
            name = eventName.startsWith('Days of ') ? iap.name?.substring(8) : iap.name;
          }
          this.iapNames[iap.guid] = name;
        });
      });
    }
  }
  togglePurchased(event, iap) {
    if (this._debugService.copyShop) {
      debugger;
      event.stopImmediatePropagation();
      event.preventDefault();
      navigator.clipboard.writeText(iap.shop?.guid ?? '');
      return;
    }
    this._iapService.togglePurchased(iap);
  }
}
EventInstanceComponent.ɵfac = function EventInstanceComponent_Factory(t) {
  return new (t || EventInstanceComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__.DataService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](src_app_services_debug_service__WEBPACK_IMPORTED_MODULE_1__.DebugService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](src_app_services_event_service__WEBPACK_IMPORTED_MODULE_2__.EventService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](src_app_services_iap_service__WEBPACK_IMPORTED_MODULE_3__.IAPService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](src_app_services_storage_service__WEBPACK_IMPORTED_MODULE_4__.StorageService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_8__.ActivatedRoute));
};
EventInstanceComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineComponent"]({
  type: EventInstanceComponent,
  selectors: [["app-event-instance"]],
  decls: 7,
  vars: 7,
  consts: [[1, "h2"], [1, "c-accent"], [4, "ngIf"], [1, "card-wrapper", "mt-2"], [1, "h3", "mb-0"], [1, "card-container", "mt-2"], [1, "card-container-inner"], ["class", "tree-wrapper p-inline-block", 4, "ngFor", "ngForOf"], [1, "tree-wrapper", "p-inline-block"], [3, "tree", "name"], [1, "card-grid", "card-grid-4", "mt-2"], [4, "ngFor", "ngForOf"], ["class", "card p-rel", 4, "ngFor", "ngForOf"], [1, "card", "p-rel"], ["container", "body", 1, "h4", 3, "ngbTooltip"], [1, "mt-2", "item"], [1, "menu-icon", 3, "fontIcon"], [1, "menu-label"], ["class", "c-partial", 4, "ngIf"], ["class", "c-full", 4, "ngIf"], ["fontIcon", "attach_money", 1, "menu-icon"], ["container", "body", 1, "menu-label", 3, "ngbTooltip"], ["class", "mt-2 item", 4, "ngIf"], [1, "mt-2", "item", "iap-items"], ["class", "iap-item point d-inline-block p-rel", 3, "click", 4, "ngFor", "ngForOf"], [1, "c-partial"], [1, "c-full"], ["svgIcon", "candle", "container", "body", "placement", "right", 1, "menu-icon", 3, "ngbTooltip"], ["svgIcon", "season-candle", "container", "body", "placement", "right", 1, "menu-icon", 3, "ngbTooltip"], ["svgIcon", "gift", "container", "body", "placement", "right", 1, "menu-icon", "seasonal", 3, "ngbTooltip"], [1, "iap-item", "point", "d-inline-block", "p-rel", 3, "click"], ["placement", "bottom", "container", "body", 3, "item", "ngbTooltip"], ["fontIcon", "done", 1, "unlock-check"], ["itemHover", ""], [1, "ws-nw"]],
  template: function EventInstanceComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "span", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](3);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](4, "date");
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](5, EventInstanceComponent_ng_container_5_Template, 7, 1, "ng-container", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](6, EventInstanceComponent_ng_container_6_Template, 6, 1, "ng-container", 2);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", ctx.instance.event.name, " ");
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind2"](4, 4, ctx.instance.date, "yyyy"));
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.instance.spirits == null ? null : ctx.instance.spirits.length);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.shops == null ? null : ctx.shops.length);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_9__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgIf, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_10__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_11__.MatIcon, _spirit_tree_spirit_tree_component__WEBPACK_IMPORTED_MODULE_5__.SpiritTreeComponent, _item_item_component__WEBPACK_IMPORTED_MODULE_6__.ItemComponent, _angular_common__WEBPACK_IMPORTED_MODULE_9__.DatePipe],
  styles: [".tree-wrapper[_ngcontent-%COMP%]   app-spirit-tree[_ngcontent-%COMP%] {\n  vertical-align: bottom;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9ldmVudC1pbnN0YW5jZS9ldmVudC1pbnN0YW5jZS5jb21wb25lbnQubGVzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLHNCQUFBO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIudHJlZS13cmFwcGVyIGFwcC1zcGlyaXQtdHJlZSB7XG4gIHZlcnRpY2FsLWFsaWduOiBib3R0b207XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
});

/***/ }),

/***/ 4572:
/*!*****************************************************!*\
  !*** ./src/app/components/event/event.component.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventComponent": () => (/* binding */ EventComponent)
/* harmony export */ });
/* harmony import */ var src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/helpers/node-helper */ 1752);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _table_table_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../table/table.component */ 9767);
/* harmony import */ var _table_table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../table/table-column/table-column.directive */ 4085);
/* harmony import */ var _table_table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../table/table-column/table-header.directive */ 7397);










function EventComponent_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "#");
  }
}
function EventComponent_ng_template_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "Name");
  }
}
function EventComponent_ng_template_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "Year");
  }
}
function EventComponent_ng_template_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "Start");
  }
}
function EventComponent_ng_template_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "End");
  }
}
function EventComponent_ng_template_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "Spirits");
  }
}
function EventComponent_ng_template_9_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "IAPs");
  }
}
function EventComponent_ng_template_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "Unlocked");
  }
}
function EventComponent_ng_template_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const row_r16 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", row_r16.number, " ");
  }
}
const _c0 = function (a1) {
  return ["/event-instance", a1];
};
function EventComponent_ng_template_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "a", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r17 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction1"](2, _c0, row_r17.guid));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](row_r17.name);
  }
}
function EventComponent_ng_template_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const row_r18 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", row_r18.year, " ");
  }
}
function EventComponent_ng_template_14_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](1, "date");
  }
  if (rf & 2) {
    const row_r19 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind2"](1, 1, row_r19.date, "dd-MM-yyyy"), " ");
  }
}
function EventComponent_ng_template_15_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](1, "date");
  }
  if (rf & 2) {
    const row_r20 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind2"](1, 1, row_r20.endDate, "dd-MM-yyyy"), " ");
  }
}
function EventComponent_ng_template_16_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const row_r21 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", row_r21.spirits, " ");
  }
}
function EventComponent_ng_template_17_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " (");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](3, "mat-icon", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](5, ") ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const row_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngbTooltip", "Contains " + row_r22.returningIaps + " returning IAPs.");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](row_r22.returningIaps);
  }
}
function EventComponent_ng_template_17_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, EventComponent_ng_template_17_ng_container_1_Template, 6, 2, "ng-container", 5);
  }
  if (rf & 2) {
    const row_r22 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", row_r22.iaps, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", row_r22.returningIaps);
  }
}
function EventComponent_ng_template_18_span_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("completed", row_r25.unlockedItems === row_r25.totalItems);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate2"](" ", row_r25.unlockedItems, " / ", row_r25.totalItems, " ");
  }
}
function EventComponent_ng_template_18_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](0, EventComponent_ng_template_18_span_0_Template, 2, 4, "span", 8);
  }
  if (rf & 2) {
    const row_r25 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", row_r25.totalItems);
  }
}
class EventComponent {
  constructor(_dataService, _route) {
    this._dataService = _dataService;
    this._route = _route;
    this.rows = [];
  }
  ngOnInit() {
    this._route.paramMap.subscribe(p => this.onParamsChanged(p));
  }
  onParamsChanged(params) {
    const guid = params.get('guid');
    this.event = this._dataService.guidMap.get(guid);
    this.instances = [];
    if (this.event.instances) {
      this.instances.push(...this.event.instances);
    }
    this.initTable();
  }
  initTable() {
    this.rows = this.instances.map((instance, i) => {
      // Count IAPs
      let iaps = 0;
      let returningIaps = 0;
      instance.shops?.forEach(shop => {
        iaps += shop.iaps?.length ?? 0;
        returningIaps += shop.iaps?.filter(v => v.returning).length ?? 0;
      });
      // Count items.
      let unlockedItems = 0;
      let totalItems = 0;
      instance.spirits?.forEach(spirit => {
        src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__.NodeHelper.getItems(spirit.tree.node).forEach(item => {
          if (item.unlocked) {
            unlockedItems++;
          }
          totalItems++;
        });
      });
      return {
        number: i + 1,
        name: this.event.name,
        year: instance.date.getFullYear(),
        guid: instance.guid,
        date: instance.date,
        endDate: instance.endDate,
        iaps,
        returningIaps,
        spirits: instance.spirits?.length ?? 0,
        unlockedItems,
        totalItems
      };
    }).reverse();
  }
}
EventComponent.ɵfac = function EventComponent_Factory(t) {
  return new (t || EventComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_1__.DataService), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.ActivatedRoute));
};
EventComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({
  type: EventComponent,
  selectors: [["app-event"]],
  decls: 19,
  vars: 2,
  consts: [[1, "h2"], [3, "rows"], [3, "appTableHeader"], [3, "appTableColumn"], [3, "routerLink"], [4, "ngIf"], ["container", "body", 1, "returning", 3, "ngbTooltip"], ["fontIcon", "undo"], [3, "completed", 4, "ngIf"]],
  template: function EventComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "app-table", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](3, EventComponent_ng_template_3_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](4, EventComponent_ng_template_4_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](5, EventComponent_ng_template_5_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](6, EventComponent_ng_template_6_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](7, EventComponent_ng_template_7_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](8, EventComponent_ng_template_8_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](9, EventComponent_ng_template_9_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](10, EventComponent_ng_template_10_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](11, EventComponent_ng_template_11_Template, 1, 1, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](12, EventComponent_ng_template_12_Template, 2, 4, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](13, EventComponent_ng_template_13_Template, 1, 1, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](14, EventComponent_ng_template_14_Template, 2, 4, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](15, EventComponent_ng_template_15_Template, 2, 4, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](16, EventComponent_ng_template_16_Template, 1, 1, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](17, EventComponent_ng_template_17_Template, 2, 2, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](18, EventComponent_ng_template_18_Template, 1, 1, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx.event.name);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("rows", ctx.rows);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_7__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_6__.RouterLink, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_8__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__.MatIcon, _table_table_component__WEBPACK_IMPORTED_MODULE_2__.TableComponent, _table_table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_3__.TableColumnDirective, _table_table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_4__.TableHeaderDirective, _angular_common__WEBPACK_IMPORTED_MODULE_7__.DatePipe],
  styles: [".returning[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  position: relative;\n  top: 6px;\n}\n.returning[_ngcontent-%COMP%] {\n  color: var(--color-old);\n}\n.completed[_ngcontent-%COMP%] {\n  color: var(--color-unlock-check);\n  font-weight: bold;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9ldmVudC9ldmVudC5jb21wb25lbnQubGVzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGtCQUFBO0VBQ0EsUUFBQTtBQUNGO0FBRUE7RUFDRSx1QkFBQTtBQUFGO0FBR0E7RUFDRSxnQ0FBQTtFQUNBLGlCQUFBO0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyIucmV0dXJuaW5nIG1hdC1pY29uIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB0b3A6IDZweDtcbn1cblxuLnJldHVybmluZyB7XG4gIGNvbG9yOiB2YXIoLS1jb2xvci1vbGQpO1xufVxuXG4uY29tcGxldGVkIHtcbiAgY29sb3I6IHZhcigtLWNvbG9yLXVubG9jay1jaGVjayk7XG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ== */"]
});

/***/ }),

/***/ 9711:
/*!*******************************************************!*\
  !*** ./src/app/components/events/events.component.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventsComponent": () => (/* binding */ EventsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/icon */ 7822);






function EventsComponent_div_6_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainer"](0);
  }
}
const _c0 = function (a0) {
  return {
    $implicit: a0
  };
};
function EventsComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, EventsComponent_div_6_ng_container_1_Template, 1, 0, "ng-container", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const event_r4 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngTemplateOutlet", _r2)("ngTemplateOutletContext", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](2, _c0, event_r4));
  }
}
function EventsComponent_div_11_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainer"](0);
  }
}
function EventsComponent_div_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, EventsComponent_div_11_ng_container_1_Template, 1, 0, "ng-container", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const event_r7 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngTemplateOutlet", _r2)("ngTemplateOutletContext", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](2, _c0, event_r7));
  }
}
function EventsComponent_ng_template_12_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 17)(1, "a", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](2, "mat-icon", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const event_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("href", event_r10._wiki.href, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"])("ngbTooltip", "Open wiki");
  }
}
function EventsComponent_ng_template_12_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "div", 20);
  }
  if (rf & 2) {
    const event_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵstyleProp"]("background-image", "url(" + event_r10.imageUrl + ")")("background-position", event_r10.imagePosition || undefined);
  }
}
const _c1 = function (a1) {
  return ["/event-instance", a1];
};
function EventsComponent_ng_template_12_a_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "a", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "mat-icon", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "span", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, " Most recent ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](6, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const event_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]().$implicit;
    const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](5, _c1, ctx_r13.lastInstances[event_r10.guid].guid));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("(", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind2"](6, 2, ctx_r13.lastInstances[event_r10.guid].date, "yyyy"), ")");
  }
}
const _c2 = function (a1) {
  return ["/event", a1];
};
function EventsComponent_ng_template_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "h2", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, EventsComponent_ng_template_12_div_2_Template, 3, 2, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](3, EventsComponent_ng_template_12_div_3_Template, 1, 4, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "a", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](5, "mat-icon", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "span", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7, " Overview ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](8, EventsComponent_ng_template_12_a_8_Template, 7, 7, "a", 16);
  }
  if (rf & 2) {
    const event_r10 = ctx.$implicit;
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](event_r10.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", event_r10._wiki == null ? null : event_r10._wiki.href);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", event_r10.imageUrl);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](5, _c2, event_r10.guid));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r3.lastInstances[event_r10.guid]);
  }
}
class EventsComponent {
  constructor(_dataService) {
    this._dataService = _dataService;
    this.lastInstances = {};
  }
  ngOnInit() {
    this.recurring = [];
    this.old = [];
    this._dataService.eventConfig.items.forEach(event => {
      if (event.recurring) {
        this.recurring.push(event);
      } else {
        this.old.push(event);
      }
      if (event.instances) {
        const instances = [...event.instances];
        const reverseInstances = [...instances].reverse();
        // Find last instance based on event.date.
        const now = new Date();
        const lastInstance = instances.find(i => now >= i.date && now <= i.endDate) ?? reverseInstances.find(instance => instance.date < now);
        this.lastInstances[event.guid] = lastInstance;
      }
    });
    this.old.reverse();
  }
}
EventsComponent.ɵfac = function EventsComponent_Factory(t) {
  return new (t || EventsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__.DataService));
};
EventsComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
  type: EventsComponent,
  selectors: [["app-events"]],
  decls: 14,
  vars: 2,
  consts: [[1, "h2"], [1, "card-wrapper"], [1, "h3", "mb-0"], [1, "card-grid", "card-grid-4", "mt-2"], ["class", "card p-rel", 4, "ngFor", "ngForOf"], [1, "card-wrapper", "mt-2"], [1, "card-grid", "card-grid-3", "mt-2"], ["eventDiv", ""], [1, "card", "p-rel"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "h3"], ["class", "wiki p-abs", 4, "ngIf"], ["class", "p-rel img", 3, "background-image", "background-position", 4, "ngIf"], [1, "mt-2", "item", 3, "routerLink"], ["fontIcon", "article", 1, "menu-icon"], [1, "menu-label"], ["class", "mt-2 item", 3, "routerLink", 4, "ngIf"], [1, "wiki", "p-abs"], ["target", "_blank", "placement", "left", "container", "body", 3, "href", "ngbTooltip"], ["fontIcon", "question_mark"], [1, "p-rel", "img"], ["fontIcon", "schedule", 1, "menu-icon"], [1, "c-accent"]],
  template: function EventsComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Events");
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 1)(3, "h2", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4, "Recurring events");
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](6, EventsComponent_div_6_Template, 2, 4, "div", 4);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](7, "div", 5)(8, "h2", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9, "Past events");
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](10, "div", 6);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](11, EventsComponent_div_11_Template, 2, 4, "div", 4);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](12, EventsComponent_ng_template_12_Template, 9, 7, "ng-template", null, 7, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplateRefExtractor"]);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](6);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.recurring);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.old);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgTemplateOutlet, _angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterLink, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_4__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__.MatIcon, _angular_common__WEBPACK_IMPORTED_MODULE_2__.DatePipe],
  styles: [".img[_ngcontent-%COMP%] {\n  box-shadow: 0 0 16px 2px var(--color-item-background) inset;\n  border-radius: var(--border-radius-round);\n  height: 160px;\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: 100%;\n  max-width: 960px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9ldmVudHMvZXZlbnRzLmNvbXBvbmVudC5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsMkRBQUE7RUFDQSx5Q0FBQTtFQUNBLGFBQUE7RUFDQSw0QkFBQTtFQUNBLDJCQUFBO0VBQ0EscUJBQUE7RUFDQSxnQkFBQTtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLmltZyB7XG4gIGJveC1zaGFkb3c6IDAgMCAxNnB4IDJweCB2YXIoLS1jb2xvci1pdGVtLWJhY2tncm91bmQpIGluc2V0O1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLXJvdW5kKTtcbiAgaGVpZ2h0OiAxNjBweDtcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgYmFja2dyb3VuZC1wb3NpdGlvbjogY2VudGVyO1xuICBiYWNrZ3JvdW5kLXNpemU6IDEwMCU7XG4gIG1heC13aWR0aDogOTYwcHg7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
});

/***/ }),

/***/ 5019:
/*!***************************************************!*\
  !*** ./src/app/components/icon/icon.component.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IconComponent": () => (/* binding */ IconComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_image_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/services/image.service */ 4249);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/platform-browser */ 4497);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/icon */ 7822);





function IconComponent_ng_container_0_img_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "img", 3);
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("src", ctx_r1.safeString || ctx_r1.safeUrl, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"]);
  }
}
function IconComponent_ng_container_0_mat_icon_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "mat-icon", 4);
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("svgIcon", ctx_r2.safeString);
  }
}
function IconComponent_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, IconComponent_ng_container_0_img_1_Template, 1, 1, "img", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, IconComponent_ng_container_0_mat_icon_2_Template, 1, 1, "mat-icon", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", !ctx_r0.isSvg);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r0.isSvg && ctx_r0.safeString);
  }
}
class IconComponent {
  constructor(_imageService, _domSanitizer) {
    this._imageService = _imageService;
    this._domSanitizer = _domSanitizer;
    this.isSvg = false;
  }
  ngOnChanges(changes) {
    if (changes['src']) {
      this.updateImage(changes['src'].currentValue);
    }
  }
  updateImage(src) {
    // Ignore stale data
    if (this._loadSource) {
      this._loadSource.unsubscribe();
      this._loadSource = undefined;
    }
    src ||= '';
    this.isSvg = src.startsWith('#');
    this.safeString = this.safeUrl = undefined;
    if (this.isSvg) {
      this.safeString = src.startsWith('#') ? src.substring(1) : src;
    } else {
      const shouldBlob = false; // src.startsWith('https://static.wikia.nocookie.net/');
      this.safeString = shouldBlob ? undefined : src;
      shouldBlob && this.loadObjectUrl(src);
    }
  }
  loadObjectUrl(src) {
    this._loadSource = this._imageService.get(src).subscribe({
      next: url => this.safeUrl = this._domSanitizer.bypassSecurityTrustUrl(url),
      error: e => console.error('Failed loading URL', src, e)
    });
  }
}
IconComponent.ɵfac = function IconComponent_Factory(t) {
  return new (t || IconComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_image_service__WEBPACK_IMPORTED_MODULE_0__.ImageService), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__.DomSanitizer));
};
IconComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
  type: IconComponent,
  selectors: [["app-icon"]],
  hostVars: 2,
  hostBindings: function IconComponent_HostBindings(rf, ctx) {
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵstyleProp"]("opacity", ctx.opacity);
    }
  },
  inputs: {
    src: "src",
    opacity: "opacity"
  },
  features: [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵNgOnChangesFeature"]],
  decls: 1,
  vars: 1,
  consts: [[4, "ngIf"], ["class", "img", 3, "src", 4, "ngIf"], [3, "svgIcon", 4, "ngIf"], [1, "img", 3, "src"], [3, "svgIcon"]],
  template: function IconComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](0, IconComponent_ng_container_0_Template, 3, 2, "ng-container", 0);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.src);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_3__.NgIf, _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__.MatIcon],
  styles: ["img[_ngcontent-%COMP%], mat-icon[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9pY29uL2ljb24uY29tcG9uZW50Lmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0VBQ0UsV0FBQTtFQUNBLFlBQUE7QUFFRiIsInNvdXJjZXNDb250ZW50IjpbImltZywgbWF0LWljb24ge1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ== */"]
});

/***/ }),

/***/ 9348:
/*!***************************************************!*\
  !*** ./src/app/components/item/item.component.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ItemComponent": () => (/* binding */ ItemComponent)
/* harmony export */ });
/* harmony import */ var src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/interfaces/item.interface */ 9037);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_debug_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/debug.service */ 3631);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _icon_icon_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../icon/icon.component */ 5019);





function ItemComponent_app_icon_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "app-icon", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ItemComponent_app_icon_0_Template_app_icon_click_0_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r3);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r2.iconClick($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("src", ctx_r0.item.icon)("opacity", ctx_r0.item.unlocked || ctx_r0.highlight ? undefined : 0.5);
  }
}
function ItemComponent_span_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "span", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("Lv", ctx_r1.item.level, "");
  }
}
class ItemComponent {
  constructor(_debug) {
    this._debug = _debug;
    this.ItemType = src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__.ItemType;
  }
  iconClick(event) {
    if (!this._debug.copyItem) {
      return;
    }
    event.stopImmediatePropagation();
    event.preventDefault();
    navigator.clipboard.writeText(this.item.guid);
  }
}
ItemComponent.ɵfac = function ItemComponent_Factory(t) {
  return new (t || ItemComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](src_app_services_debug_service__WEBPACK_IMPORTED_MODULE_1__.DebugService));
};
ItemComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
  type: ItemComponent,
  selectors: [["app-item"]],
  inputs: {
    item: "item",
    highlight: "highlight"
  },
  decls: 2,
  vars: 2,
  consts: [["class", "img", 3, "src", "opacity", "click", 4, "ngIf"], ["class", "emote-level", 4, "ngIf"], [1, "img", 3, "src", "opacity", "click"], [1, "emote-level"]],
  template: function ItemComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](0, ItemComponent_app_icon_0_Template, 1, 2, "app-icon", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, ItemComponent_span_1_Template, 2, 1, "span", 1);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.item.icon);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.item.type === ctx.ItemType.Emote);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_4__.NgIf, _icon_icon_component__WEBPACK_IMPORTED_MODULE_2__.IconComponent],
  styles: ["[_nghost-%COMP%] {\n  display: inline-block;\n  position: relative;\n  border: 0;\n  border-radius: 10px;\n  width: var(--item-size);\n  height: var(--item-size);\n}\n.img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  transition: var(--animation-short);\n  filter: drop-shadow(0 0 0 #0000);\n}\n[_nghost-%COMP%]:hover   .img[_ngcontent-%COMP%] {\n  transition: var(--animation-short);\n  filter: drop-shadow(0 0 4px #fffa73);\n}\n.img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n}\n.emote-level[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  font-size: 12px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9pdGVtL2l0ZW0uY29tcG9uZW50Lmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsU0FBQTtFQUNBLG1CQUFBO0VBQ0EsdUJBQUE7RUFDQSx3QkFBQTtBQUNGO0FBRUE7RUFDRSxXQUFBO0VBQ0EsWUFBQTtFQUNBLGtDQUFBO0VBQ0EsZ0NBQUE7QUFBRjtBQUdBO0VBRUksa0NBQUE7RUFDQSxvQ0FBQTtBQUZKO0FBTUE7RUFDRSxXQUFBO0VBQ0EsWUFBQTtBQUpGO0FBT0E7RUFDRSxrQkFBQTtFQUNBLFNBQUE7RUFDQSxPQUFBO0VBQ0EsZUFBQTtBQUxGIiwic291cmNlc0NvbnRlbnQiOlsiOmhvc3Qge1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAxMHB4O1xuICB3aWR0aDogdmFyKC0taXRlbS1zaXplKTtcbiAgaGVpZ2h0OiB2YXIoLS1pdGVtLXNpemUpO1xufVxuXG4uaW1nIHtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgdHJhbnNpdGlvbjogdmFyKC0tYW5pbWF0aW9uLXNob3J0KTtcbiAgZmlsdGVyOiBkcm9wLXNoYWRvdygwIDAgMCAjMDAwMCk7XG59XG5cbjpob3N0OmhvdmVyIHtcbiAgLmltZyB7XG4gICAgdHJhbnNpdGlvbjogdmFyKC0tYW5pbWF0aW9uLXNob3J0KTtcbiAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KDAgMCA0cHggI2ZmZmE3Myk7XG4gIH1cbn1cblxuLmltZyB7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IDEwMCU7XG59XG5cbi5lbW90ZS1sZXZlbCB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgYm90dG9tOiAwO1xuICBsZWZ0OiAwO1xuICBmb250LXNpemU6IDEycHg7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
});

/***/ }),

/***/ 9965:
/*!*****************************************************!*\
  !*** ./src/app/components/items/items.component.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ItemsComponent": () => (/* binding */ ItemsComponent)
/* harmony export */ });
/* harmony import */ var src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/interfaces/item.interface */ 9037);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _item_item_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../item/item.component */ 9348);








function ItemsComponent_div_20_div_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 19)(1, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "mat-icon", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
}
function ItemsComponent_div_20_ng_container_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](3, "app-item", 23)(4, "mat-icon", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const item_r3 = ctx.$implicit;
    const i_r4 = ctx.index;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵstyleProp"]("display", !ctx_r2.columns || !i_r4 || (i_r4 + ctx_r2.offsetNone) % ctx_r2.columns ? undefined : "block");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("item-unlocked", item_r3.unlocked);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("item", item_r3)("ngbTooltip", item_r3.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("unlocked", item_r3.unlocked);
  }
}
function ItemsComponent_div_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 1)(1, "div", 13)(2, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "div", 14)(5, "mat-icon", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ItemsComponent_div_20_Template_mat_icon_click_5_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r6);
      const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r5.setColumns());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](7, ItemsComponent_div_20_div_7_Template, 3, 0, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](8, ItemsComponent_div_20_ng_container_8_Template, 5, 8, "ng-container", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("completed", ctx_r0.shownUnlocked == ctx_r0.shownItems.length);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate2"](" ", ctx_r0.shownUnlocked, " / ", ctx_r0.shownItems.length, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Toggle column size");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("gap-half-y", ctx_r0.columns);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r0.showNone && ctx_r0.columns);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r0.shownItems);
  }
}
class ItemsComponent {
  constructor(_dataService, _route, _router) {
    this._dataService = _dataService;
    this._route = _route;
    this._router = _router;
    this.typeItems = {};
    this.typeUnlocked = {};
    this.shownItems = [];
    this.shownUnlocked = 0;
    this.showNone = false;
    this.offsetNone = 0;
    this.initializeItems();
    this.columns = +localStorage.getItem('item.columns') || undefined;
    _route.queryParamMap.subscribe(params => {
      this.onQueryParamsChanged(params);
    });
  }
  onQueryParamsChanged(query) {
    const type = query.get('type');
    this.type = type || src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__.ItemType.Outfit;
    this.shownItems = this.typeItems[this.type] ?? [];
    this.shownUnlocked = this.typeUnlocked[this.type] ?? 0;
    this.showNone = this.type === src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__.ItemType.Necklace || this.type === src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__.ItemType.Hat || this.type === src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__.ItemType.Held;
    //this.showNone = false;
    this.offsetNone = this.showNone ? 1 : 0;
  }
  setColumns() {
    switch (this.columns) {
      case 3:
        this.columns = 4;
        break;
      case 4:
        this.columns = 5;
        break;
      case 5:
        this.columns = undefined;
        break;
      default:
        this.columns = 3;
        break;
    }
    localStorage.setItem('item.columns', `${this.columns || ''}`);
  }
  selectCategory(type) {
    this._router.navigate([], {
      queryParams: {
        type
      },
      replaceUrl: true
    });
  }
  initializeItems() {
    // Clear data.
    this.typeItems = {};
    this.typeUnlocked = {};
    for (const type in src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__.ItemType) {
      this.typeItems[type] = [];
      this.typeUnlocked[type] = 0;
    }
    const addItem = (type, item) => {
      this.typeItems[type].push(item);
      if (item.unlocked) {
        this.typeUnlocked[type]++;
      }
    };
    // Load all items. Group subtypes together based on which wardrobe they appear in.
    this.items = this._dataService.itemConfig.items.slice();
    this.items.forEach(item => {
      addItem(item.type, item);
      // Subtypes.
      if (item.type === src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__.ItemType.Instrument) {
        addItem(src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__.ItemType.Held, item);
      }
    });
    // Sort by order.
    for (const type in src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__.ItemType) {
      this.typeItems[type].sort((a, b) => a.order - b.order);
    }
  }
}
ItemsComponent.ɵfac = function ItemsComponent_Factory(t) {
  return new (t || ItemsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_1__.DataService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__.Router));
};
ItemsComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
  type: ItemsComponent,
  selectors: [["app-items"]],
  decls: 21,
  vars: 25,
  consts: [[1, "h2"], [1, "card-wrapper", "mt-2"], [1, "card-flex"], ["container", "body", "placement", "bottom", 1, "card-flex-item", "category", 3, "ngbTooltip", "click"], ["svgIcon", "outfit"], ["svgIcon", "mask"], ["svgIcon", "necklace"], ["svgIcon", "hair"], ["svgIcon", "hat"], ["svgIcon", "cape"], ["svgIcon", "held"], ["svgIcon", "prop"], ["class", "card-wrapper mt-2", 4, "ngIf"], [1, "unlock-bar", "card-container-inner"], [1, "column-toggle"], ["fontIcon", "apps", "container", "body", "placement", "left", 3, "ngbTooltip", "click"], [1, "card-flex", "item-grid", "mt-2"], ["class", "card-flex-item", 4, "ngIf"], [4, "ngFor", "ngForOf"], [1, "card-flex-item"], [1, "item-none"], ["svgIcon", "none", 1, ""], [1, "item-col-hr"], ["container", "body", "placement", "bottom", 3, "item", "ngbTooltip"], ["fontIcon", "done", 1, "unlock-check", "self"]],
  template: function ItemsComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "Items");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "div", 1)(3, "div", 2)(4, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ItemsComponent_Template_div_click_4_listener() {
        return ctx.selectCategory("Outfit");
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](5, "mat-icon", 4);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ItemsComponent_Template_div_click_6_listener() {
        return ctx.selectCategory("Mask");
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](7, "mat-icon", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](8, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ItemsComponent_Template_div_click_8_listener() {
        return ctx.selectCategory("Necklace");
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](9, "mat-icon", 6);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](10, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ItemsComponent_Template_div_click_10_listener() {
        return ctx.selectCategory("Hair");
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](11, "mat-icon", 7);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](12, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ItemsComponent_Template_div_click_12_listener() {
        return ctx.selectCategory("Hat");
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](13, "mat-icon", 8);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ItemsComponent_Template_div_click_14_listener() {
        return ctx.selectCategory("Cape");
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](15, "mat-icon", 9);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](16, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ItemsComponent_Template_div_click_16_listener() {
        return ctx.selectCategory("Held");
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](17, "mat-icon", 10);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](18, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ItemsComponent_Template_div_click_18_listener() {
        return ctx.selectCategory("Prop");
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](19, "mat-icon", 11);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](20, ItemsComponent_div_20_Template, 9, 9, "div", 12);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("active", ctx.type === "Outfit");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Outfits");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("active", ctx.type === "Mask");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Masks");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("active", ctx.type === "Necklace");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Necklaces");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("active", ctx.type === "Hair");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Hair");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("active", ctx.type === "Hat");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Hats");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("active", ctx.type === "Cape");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Capes");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("active", ctx.type === "Held");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Held props");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("active", ctx.type === "Prop");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Props");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.shownItems == null ? null : ctx.shownItems.length);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_5__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_5__.NgIf, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_6__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_7__.MatIcon, _item_item_component__WEBPACK_IMPORTED_MODULE_2__.ItemComponent],
  styles: [".category[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n.category.active[_ngcontent-%COMP%] {\n  border: 1px solid var(--color-border-highlight);\n}\n.category.active[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  color: var(--color-item-highlight);\n}\n.category[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  color: var(--color-item);\n  width: var(--item-size);\n  height: var(--item-size);\n}\n.item-grid[_ngcontent-%COMP%] {\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n}\n.item-grid.gap-half-y[_ngcontent-%COMP%] {\n  row-gap: calc(var(--padding-content) / 2);\n}\n.column-toggle[_ngcontent-%COMP%] {\n  position: absolute;\n  right: var(--padding-content);\n  cursor: pointer;\n  z-index: 2;\n}\n.column-toggle[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  vertical-align: top;\n}\n.unlock-bar[_ngcontent-%COMP%] {\n  position: relative;\n}\n.item-unlocked[_ngcontent-%COMP%] {\n  background-color: var(--color-unlock-check-background-subtle);\n}\n.completed[_ngcontent-%COMP%] {\n  color: var(--color-new);\n  font-weight: bold;\n}\n.item-col-hr[_ngcontent-%COMP%] {\n  display: none;\n  flex-basis: 100%;\n  height: 0;\n  margin: 0;\n  padding: 0;\n}\n.item-none[_ngcontent-%COMP%] {\n  position: relative;\n  width: var(--item-size);\n  height: var(--item-size);\n}\n.item-none[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  color: var(--color-item);\n  width: 100%;\n  height: 100%;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9pdGVtcy9pdGVtcy5jb21wb25lbnQubGVzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGVBQUE7QUFDRjtBQUVBO0VBRUUsK0NBQUE7QUFERjtBQURBO0VBS0ksa0NBQUE7QUFESjtBQUtBO0VBQ0Usd0JBQUE7RUFDQSx1QkFBQTtFQUNBLHdCQUFBO0FBSEY7QUFNQTtFQUNFLDJEQUFBO0FBSkY7QUFPQTtFQUNFLHlDQUFBO0FBTEY7QUFRQTtFQUNFLGtCQUFBO0VBQ0EsNkJBQUE7RUFDQSxlQUFBO0VBQ0EsVUFBQTtBQU5GO0FBRUE7RUFPSSxtQkFBQTtBQU5KO0FBVUE7RUFDRSxrQkFBQTtBQVJGO0FBV0E7RUFDRSw2REFBQTtBQVRGO0FBWUE7RUFDRSx1QkFBQTtFQUNBLGlCQUFBO0FBVkY7QUFhQTtFQUNFLGFBQUE7RUFDQSxnQkFBQTtFQUNBLFNBQUE7RUFDQSxTQUFBO0VBQ0EsVUFBQTtBQVhGO0FBY0E7RUFDRSxrQkFBQTtFQUNBLHVCQUFBO0VBQ0Esd0JBQUE7QUFaRjtBQVNBO0VBTUksd0JBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtBQVpKIiwic291cmNlc0NvbnRlbnQiOlsiLmNhdGVnb3J5IHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuXG4uY2F0ZWdvcnkuYWN0aXZlIHtcbiAgLy8gYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLWJvcmRlci1oaWdobGlnaHQpO1xuXG4gIG1hdC1pY29uIHtcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItaXRlbS1oaWdobGlnaHQpO1xuICB9XG59XG5cbi5jYXRlZ29yeSBtYXQtaWNvbiB7XG4gIGNvbG9yOiB2YXIoLS1jb2xvci1pdGVtKTtcbiAgd2lkdGg6IHZhcigtLWl0ZW0tc2l6ZSk7XG4gIGhlaWdodDogdmFyKC0taXRlbS1zaXplKTtcbn1cblxuLml0ZW0tZ3JpZCB7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjAwcHgsIDFmcikpO1xufVxuXG4uaXRlbS1ncmlkLmdhcC1oYWxmLXkge1xuICByb3ctZ2FwOiBjYWxjKHZhcigtLXBhZGRpbmctY29udGVudCkgLyAyKTtcbn1cblxuLmNvbHVtbi10b2dnbGUge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHJpZ2h0OiB2YXIoLS1wYWRkaW5nLWNvbnRlbnQpO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHotaW5kZXg6IDI7XG5cbiAgbWF0LWljb24ge1xuICAgIHZlcnRpY2FsLWFsaWduOiB0b3A7XG4gIH1cbn1cblxuLnVubG9jay1iYXIge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG5cbi5pdGVtLXVubG9ja2VkIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3ItdW5sb2NrLWNoZWNrLWJhY2tncm91bmQtc3VidGxlKTtcbn1cblxuLmNvbXBsZXRlZCB7XG4gIGNvbG9yOiB2YXIoLS1jb2xvci1uZXcpO1xuICBmb250LXdlaWdodDogYm9sZDtcbn1cblxuLml0ZW0tY29sLWhyIHtcbiAgZGlzcGxheTogbm9uZTtcbiAgZmxleC1iYXNpczogMTAwJTtcbiAgaGVpZ2h0OiAwO1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG59XG5cbi5pdGVtLW5vbmUge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHdpZHRoOiB2YXIoLS1pdGVtLXNpemUpO1xuICBoZWlnaHQ6IHZhcigtLWl0ZW0tc2l6ZSk7XG5cbiAgbWF0LWljb24ge1xuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1pdGVtKTtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
});

/***/ }),

/***/ 5819:
/*!***************************************************!*\
  !*** ./src/app/components/menu/menu.component.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MenuComponent": () => (/* binding */ MenuComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/cdk/layout */ 3278);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/icon */ 7822);





class MenuComponent {
  constructor(_breakpointObserver) {
    this._breakpointObserver = _breakpointObserver;
    this.wide = false;
    _breakpointObserver.observe(['(min-width: 992px)']).subscribe(s => this.onLg(s));
  }
  onLg(state) {
    this.wide = state.matches;
  }
}
MenuComponent.ɵfac = function MenuComponent_Factory(t) {
  return new (t || MenuComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_cdk_layout__WEBPACK_IMPORTED_MODULE_1__.BreakpointObserver));
};
MenuComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
  type: MenuComponent,
  selectors: [["app-menu"]],
  decls: 42,
  vars: 16,
  consts: [[1, "header"], [1, "title"], [1, "items"], ["routerLinkActive", "active", "placement", "right", "container", "body", 1, "item", 3, "routerLink", "ngbTooltip"], ["fontIcon", "auto_awesome"], [1, "name"], ["fontIcon", "ac_unit"], ["fontIcon", "hikings"], ["fontIcon", "celebration"], ["fontIcon", "shopping_cart"], ["fontIcon", "checkroom"], ["href", "https://sky-clock.netlify.app/", "target", "_blank", "placement", "right", "container", "body", 1, "item", 3, "ngbTooltip"], ["fontIcon", "schedule"], ["href", "https://github.com/Silverfeelin/SkyGame-Planner/", "target", "_blank", "placement", "right", "container", "body", 1, "item", 3, "ngbTooltip"], ["fontIcon", "code"], ["fontIcon", "info"]],
  template: function MenuComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "aside")(1, "nav")(2, "div", 0)(3, "span", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4, "Sky Planner");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "div", 2)(6, "a", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](7, "mat-icon", 4);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "span", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](9, "Realms");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "a", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](11, "mat-icon", 6);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "span", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](13, "Seasons");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](14, "a", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](15, "mat-icon", 7);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](16, "span", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](17, "Traveling Spirits");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "a", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](19, "mat-icon", 8);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](20, "span", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](21, "Events");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](22, "a", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](23, "mat-icon", 9);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](24, "span", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](25, "Permanent IAP");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](26, "a", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](27, "mat-icon", 10);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](28, "span", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](29, "Items");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](30, "a", 11);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](31, "mat-icon", 12);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](32, "span", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](33, "Sky Clock");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](34, "a", 13);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](35, "mat-icon", 14);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](36, "span", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](37, "GitHub");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](38, "a", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](39, "mat-icon", 15);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](40, "span", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](41, "Credits");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()()()()();
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](6);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", "realm")("ngbTooltip", ctx.wide ? "" : "Realms");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", "season")("ngbTooltip", ctx.wide ? "" : "Seasons");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", "ts")("ngbTooltip", ctx.wide ? "" : "Traveling Spirits");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", "event")("ngbTooltip", ctx.wide ? "" : "Events");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", "shop")("ngbTooltip", ctx.wide ? "" : "Shop");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", "item")("ngbTooltip", ctx.wide ? "" : "Items");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngbTooltip", ctx.wide ? "" : "Sky Clock");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngbTooltip", ctx.wide ? "" : "GitHub");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", "credits")("ngbTooltip", ctx.wide ? "" : "Credits");
    }
  },
  dependencies: [_angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterLink, _angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterLinkActive, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_3__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__.MatIcon],
  styles: ["aside[_ngcontent-%COMP%] {\n  position: fixed;\n  left: 0;\n  top: 0;\n  bottom: 0;\n  width: var(--menu-width);\n  background-color: var(--color-item-background);\n  z-index: 100;\n  overflow-y: auto;\n}\n.header[_ngcontent-%COMP%] {\n  padding: 10px;\n  font-size: 24px;\n  text-align: left;\n}\n.items[_ngcontent-%COMP%] {\n  position: relative;\n  font-size: 18px;\n}\n.item[_ngcontent-%COMP%] {\n  display: block;\n  padding: 15px 10px;\n  cursor: pointer;\n}\n.item.active[_ngcontent-%COMP%] {\n  background-color: var(--color-item-background-highlight);\n}\n.item[_ngcontent-%COMP%]:hover {\n  background-color: var(--color-item-background-highlight);\n}\n.item[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  vertical-align: sub;\n}\n.item[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  padding-left: 10px;\n}\na[_ngcontent-%COMP%]:hover, a[_ngcontent-%COMP%]:focus, a[_ngcontent-%COMP%]:active, a[_ngcontent-%COMP%]:visited {\n  color: unset;\n}\n\n.header[_ngcontent-%COMP%], .name[_ngcontent-%COMP%] {\n  display: none;\n}\n@media screen and (min-width: 992px) {\n  .header[_ngcontent-%COMP%] {\n    display: block;\n  }\n  .name[_ngcontent-%COMP%] {\n    display: inline-block;\n  }\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9tZW51L21lbnUuY29tcG9uZW50Lmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxlQUFBO0VBQ0EsT0FBQTtFQUNBLE1BQUE7RUFDQSxTQUFBO0VBQ0Esd0JBQUE7RUFDQSw4Q0FBQTtFQUNBLFlBQUE7RUFDQSxnQkFBQTtBQUNGO0FBRUE7RUFDRSxhQUFBO0VBQ0EsZUFBQTtFQUNBLGdCQUFBO0FBQUY7QUFHQTtFQUNFLGtCQUFBO0VBQ0EsZUFBQTtBQURGO0FBSUE7RUFDRSxjQUFBO0VBQ0Esa0JBQUE7RUFDQSxlQUFBO0FBRkY7QUFLQTtFQUNFLHdEQUFBO0FBSEY7QUFNQTtFQUNFLHdEQUFBO0FBSkY7QUFPQTtFQUNFLG1CQUFBO0FBTEY7QUFRQTtFQUNFLGtCQUFBO0FBTkY7QUFVQTs7OztFQUNFLFlBQUE7QUFMRjtBQUNBLGVBQWU7QUFTZjs7RUFDRSxhQUFBO0FBTkY7QUFTQTtFQUNFO0lBQ0UsY0FBQTtFQVBGO0VBVUE7SUFDRSxxQkFBQTtFQVJGO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJhc2lkZSB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgbGVmdDogMDtcbiAgdG9wOiAwO1xuICBib3R0b206IDA7XG4gIHdpZHRoOiB2YXIoLS1tZW51LXdpZHRoKTtcbiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3ItaXRlbS1iYWNrZ3JvdW5kKTtcbiAgei1pbmRleDogMTAwO1xuICBvdmVyZmxvdy15OiBhdXRvO1xufVxuXG4uaGVhZGVyIHtcbiAgcGFkZGluZzogMTBweDtcbiAgZm9udC1zaXplOiAyNHB4O1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xufVxuXG4uaXRlbXMge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGZvbnQtc2l6ZTogMThweDtcbn1cblxuLml0ZW0ge1xuICBkaXNwbGF5OiBibG9jaztcbiAgcGFkZGluZzogMTVweCAxMHB4O1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG5cbi5pdGVtLmFjdGl2ZSB7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLWl0ZW0tYmFja2dyb3VuZC1oaWdobGlnaHQpO1xufVxuXG4uaXRlbTpob3ZlciB7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLWl0ZW0tYmFja2dyb3VuZC1oaWdobGlnaHQpO1xufVxuXG4uaXRlbSBtYXQtaWNvbiB7XG4gIHZlcnRpY2FsLWFsaWduOiBzdWI7XG59XG5cbi5pdGVtIHNwYW4ge1xuICBwYWRkaW5nLWxlZnQ6IDEwcHg7XG59XG5cblxuYTpob3ZlciwgYTpmb2N1cywgYTphY3RpdmUsIGE6dmlzaXRlZCB7XG4gIGNvbG9yOiB1bnNldDtcbn1cblxuLyogUkVTUE9OU0lWRSAqL1xuXG4uaGVhZGVyLCAubmFtZSB7XG4gIGRpc3BsYXk6IG5vbmU7XG59XG5cbkBtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDk5MnB4KSB7XG4gIC5oZWFkZXIge1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICB9XG5cbiAgLm5hbWUge1xuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ== */"]
});

/***/ }),

/***/ 4893:
/*!***************************************************!*\
  !*** ./src/app/components/node/node.component.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NodeComponent": () => (/* binding */ NodeComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_event_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/services/event.service */ 9426);
/* harmony import */ var src_app_services_storage_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/storage.service */ 1188);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _item_item_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../item/item.component */ 9348);







function NodeComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function NodeComponent_div_1_Template_div_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r9);
      const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r8.toggleNode());
    })("mouseenter", function NodeComponent_div_1_Template_div_mouseenter_0_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r9);
      const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r10.mouseEnter($event));
    })("mouseleave", function NodeComponent_div_1_Template_div_mouseleave_0_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r9);
      const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r11.mouseLeave($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "app-item", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵreference"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", _r6)("placement", ctx_r0.tooltipPlacement);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("item", ctx_r0.node.item)("highlight", ctx_r0.hover);
  }
}
function NodeComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "mat-icon", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r1.node.c, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("inline", false);
  }
}
function NodeComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "mat-icon", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r2.node.sc, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("inline", false);
  }
}
function NodeComponent_div_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "mat-icon", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r3.node.h, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("inline", false);
  }
}
function NodeComponent_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "mat-icon", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r4.node.sh, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("inline", false);
  }
}
function NodeComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "mat-icon", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r5.node.ac, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("inline", false);
  }
}
function NodeComponent_ng_template_8_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "span", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r12.node.item.name);
  }
}
function NodeComponent_ng_template_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](0, NodeComponent_ng_template_8_ng_container_0_Template, 3, 1, "ng-container", 16);
  }
  if (rf & 2) {
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r7.node.item);
  }
}
class NodeComponent {
  constructor(_eventService, _storageService) {
    this._eventService = _eventService;
    this._storageService = _storageService;
    this.position = 'center';
    this.tooltipPlacement = 'bottom';
  }
  ngOnChanges(changes) {
    if (changes['position']) {
      const pos = changes['position'].currentValue;
      this.tooltipPlacement = pos === 'left' ? 'bottom-start' : pos === 'right' ? 'bottom-end' : 'bottom';
    }
  }
  mouseEnter(event) {
    this.hover = true;
  }
  mouseLeave(event) {
    this.hover = false;
  }
  toggleNode() {
    if (!this.node.item) {
      return;
    }
    const item = this.node.item;
    // Unlock (or lock) based on the item status.
    const unlock = !item.unlocked;
    // Save progress.
    if (unlock) {
      this.unlockItem();
    } else {
      this.lockItem();
    }
    // Notify listeners.
    this._eventService.toggleItem(item);
  }
  unlockItem() {
    if (!this.node.item) {
      return;
    }
    // Unlock the item.
    this.node.item.unlocked = true;
    // Unlock the node to track costs. Other nodes are not unlocked but will appear unlocked by the item status.
    this.node.unlocked = true;
    // Save data.
    this._storageService.add(this.node.item.guid, this.node.guid);
    this._storageService.save();
  }
  lockItem() {
    if (!this.node.item) {
      return;
    }
    // Remove unlock from item.
    this.node.item.unlocked = false;
    // Remove unlock from all nodes since the unlocked node might be from a different constellation.
    const nodes = this.node.item.nodes || [];
    nodes.forEach(n => n.unlocked = false);
    // Save data.
    this._storageService.remove(this.node.item.guid, ...nodes?.map(n => n.guid));
    this._storageService.save();
  }
}
NodeComponent.ɵfac = function NodeComponent_Factory(t) {
  return new (t || NodeComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](src_app_services_event_service__WEBPACK_IMPORTED_MODULE_0__.EventService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](src_app_services_storage_service__WEBPACK_IMPORTED_MODULE_1__.StorageService));
};
NodeComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
  type: NodeComponent,
  selectors: [["app-node"]],
  inputs: {
    node: "node",
    position: "position"
  },
  features: [_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵNgOnChangesFeature"]],
  decls: 10,
  vars: 11,
  consts: [["class", "item-container", "container", "body", 3, "ngbTooltip", "placement", "click", "mouseenter", "mouseleave", 4, "ngIf"], ["class", "cost", 4, "ngIf"], ["class", "cost seasonal", 4, "ngIf"], ["class", "cost ascend", 4, "ngIf"], ["fontIcon", "done", 1, "unlock-check"], ["nodeHover", ""], ["container", "body", 1, "item-container", 3, "ngbTooltip", "placement", "click", "mouseenter", "mouseleave"], [3, "item", "highlight"], [1, "cost"], ["svgIcon", "candle", 3, "inline"], ["svgIcon", "season-candle", 3, "inline"], ["svgIcon", "heart", 3, "inline"], [1, "cost", "seasonal"], ["svgIcon", "season-heart", 3, "inline"], [1, "cost", "ascend"], ["svgIcon", "ascended-candle", 3, "inline"], [4, "ngIf"], [1, "ws-nw"]],
  template: function NodeComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, NodeComponent_div_1_Template, 2, 4, "div", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, NodeComponent_div_2_Template, 3, 2, "div", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](3, NodeComponent_div_3_Template, 3, 2, "div", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](4, NodeComponent_div_4_Template, 3, 2, "div", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](5, NodeComponent_div_5_Template, 3, 2, "div", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](6, NodeComponent_div_6_Template, 3, 2, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](7, "mat-icon", 4);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](8, NodeComponent_ng_template_8_Template, 1, 1, "ng-template", null, 5, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplateRefExtractor"]);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵattribute"]("data-position", ctx.position);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.node.item);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.node == null ? null : ctx.node.c);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.node == null ? null : ctx.node.sc);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.node == null ? null : ctx.node.h);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.node == null ? null : ctx.node.sh);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.node == null ? null : ctx.node.ac);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("unlocked", ctx.node.unlocked || (ctx.node.item == null ? null : ctx.node.item.unlocked))("self", ctx.node.unlocked);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_4__.NgIf, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_5__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__.MatIcon, _item_item_component__WEBPACK_IMPORTED_MODULE_2__.ItemComponent],
  styles: ["[_nghost-%COMP%] {\n  position: relative;\n  display: inline-block;\n  width: 100%;\n  height: 100%;\n  -webkit-user-select: none;\n          user-select: none;\n}\n.item-container[_ngcontent-%COMP%] {\n  display: inline-block;\n  cursor: pointer;\n}\n.cost[_ngcontent-%COMP%] {\n  float: right;\n  text-align: right;\n  right: calc(50% + 3px);\n  position: relative;\n}\n.cost[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  fill: var(--color-candle);\n}\ndiv[data-position=\"left\"][_ngcontent-%COMP%]   .cost[_ngcontent-%COMP%] {\n  left: unset;\n  right: 0;\n}\nmat-icon[_ngcontent-%COMP%] {\n  width: 18px;\n  vertical-align: text-bottom;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9ub2RlL25vZGUuY29tcG9uZW50Lmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxrQkFBQTtFQUNBLHFCQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSx5QkFBQTtVQUFBLGlCQUFBO0FBQ0Y7QUFFQTtFQUNFLHFCQUFBO0VBQ0EsZUFBQTtBQUFGO0FBR0E7RUFDRSxZQUFBO0VBQ0EsaUJBQUE7RUFDQSxzQkFBQTtFQUNBLGtCQUFBO0FBREY7QUFIQTtFQU1hLHlCQUFBO0FBQWI7QUFHQTtFQUNFLFdBQUE7RUFDQSxRQUFBO0FBREY7QUFJQTtFQUNFLFdBQUE7RUFDQSwyQkFBQTtBQUZGIiwic291cmNlc0NvbnRlbnQiOlsiOmhvc3Qge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XG59XG5cbi5pdGVtLWNvbnRhaW5lciB7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuXG4uY29zdCB7XG4gIGZsb2F0OiByaWdodDtcbiAgdGV4dC1hbGlnbjogcmlnaHQ7XG4gIHJpZ2h0OiBjYWxjKDUwJSArIDNweCk7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcblxuICBtYXQtaWNvbiB7IGZpbGw6IHZhcigtLWNvbG9yLWNhbmRsZSk7IH1cbn1cblxuZGl2W2RhdGEtcG9zaXRpb249XCJsZWZ0XCJdIC5jb3N0IHtcbiAgbGVmdDogdW5zZXQ7XG4gIHJpZ2h0OiAwO1xufVxuXG5tYXQtaWNvbiB7XG4gIHdpZHRoOiAxOHB4O1xuICB2ZXJ0aWNhbC1hbGlnbjogdGV4dC1ib3R0b207XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
});

/***/ }),

/***/ 5712:
/*!*******************************************************!*\
  !*** ./src/app/components/realms/realms.component.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RealmsComponent": () => (/* binding */ RealmsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/icon */ 7822);






function RealmsComponent_div_3_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 8)(1, "a", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](2, "mat-icon", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const realm_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("href", realm_r1._wiki.href, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"])("ngbTooltip", "Open wiki");
  }
}
function RealmsComponent_div_3_div_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "div", 11);
  }
  if (rf & 2) {
    const realm_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵstyleProp"]("background-image", "url(" + realm_r1.imageUrl + ")");
  }
}
const _c0 = function (a0) {
  return {
    realm: a0,
    type: "Regular,Elder"
  };
};
function RealmsComponent_div_3_a_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "a", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "mat-icon", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "span", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, "Spirits\u00A0");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "span", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const realm_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]().$implicit;
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", "/spirit")("queryParams", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](3, _c0, realm_r1.guid));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("(", ctx_r4.spiritCount[realm_r1.guid], ")");
  }
}
function RealmsComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 3)(1, "h2", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](3, RealmsComponent_div_3_div_3_Template, 3, 2, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](4, RealmsComponent_div_3_div_4_Template, 1, 2, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](5, RealmsComponent_div_3_a_5_Template, 6, 5, "a", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const realm_r1 = ctx.$implicit;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](realm_r1.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", realm_r1._wiki == null ? null : realm_r1._wiki.href);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", realm_r1.imageUrl);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r0.spiritCount[realm_r1.guid]);
  }
}
class RealmsComponent {
  constructor(_dataService) {
    this._dataService = _dataService;
    this.realms = _dataService.realmConfig.items;
    this.visibleRealms = this.realms.filter(r => !r.hidden);
  }
  ngOnInit() {
    this.spiritCount = {};
    for (const realm of this.realms) {
      // Count spirits in area.
      this.spiritCount[realm.guid] = realm.areas?.reduce((a, v) => {
        return a + (v.spirits ?? []).filter(s => s.type === 'Regular' || s.type === 'Elder').length;
      }, 0) ?? 0;
    }
  }
}
RealmsComponent.ɵfac = function RealmsComponent_Factory(t) {
  return new (t || RealmsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__.DataService));
};
RealmsComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
  type: RealmsComponent,
  selectors: [["app-realms"]],
  decls: 4,
  vars: 1,
  consts: [[1, "h2"], [1, "card-grid", "card-grid-3"], ["class", "card p-rel", 4, "ngFor", "ngForOf"], [1, "card", "p-rel"], [1, "h3"], ["class", "wiki p-abs", 4, "ngIf"], ["class", "p-rel img", 3, "background-image", 4, "ngIf"], ["class", "mt-2 item link", 3, "routerLink", "queryParams", 4, "ngIf"], [1, "wiki", "p-abs"], ["target", "_blank", "placement", "left", "container", "body", 3, "href", "ngbTooltip"], ["fontIcon", "question_mark"], [1, "p-rel", "img"], [1, "mt-2", "item", "link", 3, "routerLink", "queryParams"], ["fontIcon", "list", 1, "menu-icon"], [1, "menu-label"], [1, "c-accent"]],
  template: function RealmsComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Realms");
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](3, RealmsComponent_div_3_Template, 6, 4, "div", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.visibleRealms);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterLink, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_4__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__.MatIcon],
  styles: [".img[_ngcontent-%COMP%] {\n  box-shadow: 0 0 16px 2px var(--color-item-background) inset;\n  border-radius: var(--border-radius-round);\n  height: 160px;\n  background-size: cover;\n  background-position: bottom;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9yZWFsbXMvcmVhbG1zLmNvbXBvbmVudC5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsMkRBQUE7RUFDQSx5Q0FBQTtFQUNBLGFBQUE7RUFDQSxzQkFBQTtFQUNBLDJCQUFBO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIuaW1nIHtcbiAgYm94LXNoYWRvdzogMCAwIDE2cHggMnB4IHZhcigtLWNvbG9yLWl0ZW0tYmFja2dyb3VuZCkgaW5zZXQ7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtcm91bmQpO1xuICBoZWlnaHQ6IDE2MHB4O1xuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xuICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiBib3R0b207XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
});

/***/ }),

/***/ 8229:
/*!*******************************************************!*\
  !*** ./src/app/components/season/season.component.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SeasonComponent": () => (/* binding */ SeasonComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var src_app_services_iap_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/iap.service */ 5699);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _spirit_tree_spirit_tree_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../spirit-tree/spirit-tree.component */ 5985);
/* harmony import */ var _item_item_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../item/item.component */ 9348);









function SeasonComponent_app_spirit_tree_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "app-spirit-tree", 9);
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("tree", ctx_r0.guide.tree)("name", ctx_r0.guide.name);
  }
}
const _c0 = function (a1) {
  return ["/spirit", a1];
};
const _c1 = function (a0) {
  return {
    highlightTree: a0
  };
};
function SeasonComponent_ng_container_9_ng_container_1_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 5)(1, "app-spirit-tree", 9)(2, "div", 12)(3, "a", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()();
  }
  if (rf & 2) {
    const spirit_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("tree", spirit_r6.tree)("name", spirit_r6.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpureFunction1"](5, _c0, spirit_r6.guid))("queryParams", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpureFunction1"](7, _c1, spirit_r6.tree.guid));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", spirit_r6.name, " ");
  }
}
function SeasonComponent_ng_container_9_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, SeasonComponent_ng_container_9_ng_container_1_div_1_Template, 5, 9, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const spirit_r6 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", spirit_r6.tree);
  }
}
function SeasonComponent_ng_container_9_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, SeasonComponent_ng_container_9_ng_container_1_Template, 2, 1, "ng-container", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r1.spirits);
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_span_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, "Returning IAP");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_span_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, "New IAP");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_span_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const shop_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](shop_r10.name);
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_span_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, "Premium Candle Store");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_span_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const shop_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3).$implicit;
    let tmp_0_0;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"]((tmp_0_0 = shop_r10.name) !== null && tmp_0_0 !== undefined ? tmp_0_0 : shop_r10.spirit == null ? null : shop_r10.spirit.name);
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_18_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "mat-icon", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "span", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const iap_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngbTooltip", "Regular candles");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", iap_r13.c, " ");
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_18_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "mat-icon", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "span", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const iap_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngbTooltip", "Season candles");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", iap_r13.sc, " ");
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_18_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "mat-icon", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "span", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const iap_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngbTooltip", "Gift Season Pass");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", iap_r13.sp, " ");
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_18_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_18_ng_container_1_Template, 4, 2, "ng-container", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_18_ng_container_2_Template, 4, 2, "ng-container", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](3, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_18_ng_container_3_Template, 4, 2, "ng-container", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const iap_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", iap_r13.c);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", iap_r13.sc);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", iap_r13.sp);
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_20_ng_template_3_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "span", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const item_r30 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](item_r30.name);
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_20_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](0, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_20_ng_template_3_ng_container_0_Template, 3, 1, "ng-container", 7);
  }
  if (rf & 2) {
    const item_r30 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", item_r30);
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r38 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_20_Template_div_click_0_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r38);
      const iap_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
      const ctx_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](4);
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r36.togglePurchased($event, iap_r13));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "app-item", 34)(2, "mat-icon", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](3, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_20_ng_template_3_Template, 1, 1, "ng-template", null, 36, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const item_r30 = ctx.$implicit;
    const _r31 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵreference"](4);
    const iap_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("item", item_r30)("ngbTooltip", _r31);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("unlocked", iap_r13.bought || (item_r30 == null ? null : item_r30.unlocked))("self", iap_r13.bought);
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 16)(1, "h3", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](4, "mat-icon", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "span", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_span_6_Template, 2, 0, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](7, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_span_7_Template, 2, 0, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](8, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](9, "mat-icon", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](10, "span", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](11, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_span_11_Template, 2, 1, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](12, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_span_12_Template, 2, 0, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](13, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_span_13_Template, 2, 1, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](14, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](15, "mat-icon", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](16, "span", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](18, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_18_Template, 4, 3, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](19, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](20, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_div_20_Template, 5, 6, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const iap_r13 = ctx.$implicit;
    const shop_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngbTooltip", iap_r13.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", iap_r13.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("fontIcon", iap_r13.returning ? "undo" : "grade");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", iap_r13.returning);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", !iap_r13.returning);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("fontIcon", "location_on");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", shop_r10.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", !shop_r10.name && shop_r10.type === "Store");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", !shop_r10.name && shop_r10.type !== "Store");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngbTooltip", "Price of the IAP in USD.");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", iap_r13.price, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", iap_r13.c || iap_r13.sc || iap_r13.sp);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", iap_r13.items);
  }
}
function SeasonComponent_ng_container_10_ng_container_5_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_div_1_Template, 21, 13, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const shop_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", shop_r10.iaps);
  }
}
function SeasonComponent_ng_container_10_ng_container_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, SeasonComponent_ng_container_10_ng_container_5_ng_container_1_Template, 2, 1, "ng-container", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const shop_r10 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", shop_r10.iaps == null ? null : shop_r10.iaps.length);
  }
}
function SeasonComponent_ng_container_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "div", 1)(2, "h2", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3, "In-App Purchases");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](5, SeasonComponent_ng_container_10_ng_container_5_Template, 2, 1, "ng-container", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r2.shops);
  }
}
function SeasonComponent_ng_template_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, "Total cost of all the items in this tree.");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](2, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "span", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4, "Remaining cost of items not yet unlocked.");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
}
class SeasonComponent {
  constructor(_dataService, _iapService, _route) {
    this._dataService = _dataService;
    this._iapService = _iapService;
    this._route = _route;
    this.spirits = [];
    this.shops = [];
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }
  onParamsChanged(params) {
    const guid = params.get('guid');
    this.initializeSeason(guid);
  }
  initializeSeason(guid) {
    this.season = this._dataService.guidMap.get(guid);
    this.guide = undefined;
    this.spirits = [];
    this.season?.spirits?.forEach(spirit => {
      switch (spirit.type) {
        case 'Guide':
          this.guide = spirit;
          break;
        case 'Season':
          this.spirits.push(spirit);
          break;
      }
    });
    this.shops = this.season.shops ?? [];
  }
  togglePurchased(event, iap) {
    this._iapService.togglePurchased(iap);
  }
}
SeasonComponent.ɵfac = function SeasonComponent_Factory(t) {
  return new (t || SeasonComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__.DataService), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](src_app_services_iap_service__WEBPACK_IMPORTED_MODULE_1__.IAPService), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__.ActivatedRoute));
};
SeasonComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({
  type: SeasonComponent,
  selectors: [["app-season"]],
  decls: 13,
  vars: 4,
  consts: [[1, "h2"], [1, "card-wrapper", "mt-2"], [1, "h3", "mb-0"], [1, "card-container", "card-container-scroll-x", "mt-2"], [1, "card-container-inner"], [1, "tree-wrapper"], [3, "tree", "name", 4, "ngIf"], [4, "ngIf"], ["costHover", ""], [3, "tree", "name"], [4, "ngFor", "ngForOf"], ["class", "tree-wrapper", 4, "ngIf"], ["name", ""], [3, "routerLink", "queryParams"], [1, "card-grid", "card-grid-4", "mt-2"], ["class", "card p-rel", 4, "ngFor", "ngForOf"], [1, "card", "p-rel"], ["container", "body", 1, "h4", 3, "ngbTooltip"], [1, "mt-2", "item"], [1, "menu-icon", 3, "fontIcon"], [1, "menu-label"], ["class", "c-partial", 4, "ngIf"], ["class", "c-full", 4, "ngIf"], ["fontIcon", "attach_money", 1, "menu-icon"], ["container", "body", 1, "menu-label", 3, "ngbTooltip"], ["class", "mt-2 item", 4, "ngIf"], [1, "mt-2", "item", "iap-items"], ["class", "iap-item point d-inline-block p-rel", 3, "click", 4, "ngFor", "ngForOf"], [1, "c-partial"], [1, "c-full"], ["svgIcon", "candle", "container", "body", "placement", "right", 1, "menu-icon", 3, "ngbTooltip"], ["svgIcon", "season-candle", "container", "body", "placement", "right", 1, "menu-icon", 3, "ngbTooltip"], ["svgIcon", "gift", "container", "body", "placement", "right", 1, "menu-icon", "seasonal", 3, "ngbTooltip"], [1, "iap-item", "point", "d-inline-block", "p-rel", 3, "click"], ["placement", "bottom", "container", "body", 3, "item", "ngbTooltip"], ["fontIcon", "done", 1, "unlock-check"], ["itemHover", ""], [1, "ws-nw"], [1, "remaining-cost"]],
  template: function SeasonComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "div", 1)(3, "h2", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4, "Spirits");
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "div", 3)(6, "div", 4)(7, "div", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](8, SeasonComponent_app_spirit_tree_8_Template, 1, 2, "app-spirit-tree", 6);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](9, SeasonComponent_ng_container_9_Template, 2, 1, "ng-container", 7);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](10, SeasonComponent_ng_container_10_Template, 6, 1, "ng-container", 7);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](11, SeasonComponent_ng_template_11_Template, 5, 0, "ng-template", null, 8, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplateRefExtractor"]);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx.season.name);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](7);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.guide == null ? null : ctx.guide.tree);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.spirits);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.shops.length);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_6__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterLink, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_7__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_8__.MatIcon, _spirit_tree_spirit_tree_component__WEBPACK_IMPORTED_MODULE_2__.SpiritTreeComponent, _item_item_component__WEBPACK_IMPORTED_MODULE_3__.ItemComponent],
  styles: ["app-spirit-tree[_ngcontent-%COMP%] {\n  vertical-align: bottom;\n}\n.tree-wrapper[_ngcontent-%COMP%] {\n  display: inline-block;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9zZWFzb24vc2Vhc29uLmNvbXBvbmVudC5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0Usc0JBQUE7QUFDRjtBQUVBO0VBQ0UscUJBQUE7QUFBRiIsInNvdXJjZXNDb250ZW50IjpbImFwcC1zcGlyaXQtdHJlZSB7XG4gIHZlcnRpY2FsLWFsaWduOiBib3R0b207XG59XG5cbi50cmVlLXdyYXBwZXIge1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
});

/***/ }),

/***/ 5551:
/*!*********************************************************!*\
  !*** ./src/app/components/seasons/seasons.component.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SeasonsComponent": () => (/* binding */ SeasonsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/icon */ 7822);






const _c0 = function (a1) {
  return ["/season", a1];
};
function SeasonsComponent_a_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "a", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "img", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const season_r2 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](3, _c0, season_r2.guid))("ngbTooltip", season_r2.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("src", season_r2.iconUrl, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"]);
  }
}
function SeasonsComponent_div_5_div_5_div_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 23)(1, "a", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](2, "mat-icon", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const season_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("href", season_r5._wiki.href, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"])("ngbTooltip", "Open wiki");
  }
}
const _c1 = function (a0) {
  return {
    season: a0,
    type: "Season,Guide"
  };
};
function SeasonsComponent_div_5_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 12)(1, "h2", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](2, "img", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "span", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](6, SeasonsComponent_div_5_div_5_div_6_Template, 3, 2, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](7, "a", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](8, "mat-icon", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "span", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](10, "Overview");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](11, "a", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](12, "mat-icon", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](13, "span", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](14, "Spirits ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](15, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
  }
  if (rf & 2) {
    const season_r5 = ctx.$implicit;
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("src", season_r5.iconUrl, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", season_r5.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("#", season_r5.number, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", season_r5._wiki == null ? null : season_r5._wiki.href);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](8, _c0, season_r5.guid));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", "/spirit")("queryParams", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](10, _c1, season_r5.guid));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("(", ctx_r4.spiritCount[season_r5.guid], ")");
  }
}
function SeasonsComponent_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 7)(1, "div", 8)(2, "h2", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](5, SeasonsComponent_div_5_div_5_Template, 17, 12, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const year_r3 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](year_r3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx_r1.yearMap[year_r3]);
  }
}
class SeasonsComponent {
  constructor(_dataService) {
    this._dataService = _dataService;
    this.years = [];
    this.seasons = _dataService.seasonConfig.items;
    this.reverseSeasons = this.seasons.slice().reverse();
  }
  ngOnInit() {
    let year = this.seasons.at(-1).year + 1;
    this.yearMap = {};
    this.spiritCount = {};
    for (let i = this.seasons.length - 1; i >= 0; i--) {
      const season = this.seasons[i];
      if (season.year < year) {
        year = season.year;
        this.years.push(year);
        this.yearMap[year] = [];
      }
      this.yearMap[year].push(season);
      this.spiritCount[season.guid] = season.spirits.filter(s => s.type === 'Season').length;
    }
  }
}
SeasonsComponent.ɵfac = function SeasonsComponent_Factory(t) {
  return new (t || SeasonsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__.DataService));
};
SeasonsComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
  type: SeasonsComponent,
  selectors: [["app-seasons"]],
  decls: 6,
  vars: 2,
  consts: [[1, "h2"], [1, "card-wrapper", "mt-2"], [1, "card-flex"], ["class", "card-flex-item", "placement", "bottom", "container", "body", 3, "routerLink", "ngbTooltip", 4, "ngFor", "ngForOf"], ["class", "mt-2", 4, "ngFor", "ngForOf"], ["placement", "bottom", "container", "body", 1, "card-flex-item", 3, "routerLink", "ngbTooltip"], [1, "season-icon", 3, "src"], [1, "mt-2"], [1, "card-wrapper", "wrapper-year"], [1, "h3", "mb-0"], [1, "card-grid", "card-grid-2", "mt-2"], ["class", "card p-rel", 4, "ngFor", "ngForOf"], [1, "card", "p-rel"], [1, "h3"], [1, "season-icon", "season-icon-medium", 3, "src"], [1, "h5", "c-accent", "number"], ["class", "wiki p-abs", 4, "ngIf"], [1, "mt-2", "item", "link", 3, "routerLink"], ["fontIcon", "article", 1, "menu-icon"], [1, "menu-label"], [1, "mt-2", "item", "link", 3, "routerLink", "queryParams"], ["fontIcon", "list", 1, "menu-icon"], [1, "c-accent"], [1, "wiki", "p-abs"], ["target", "_blank", "placement", "left", "container", "body", 3, "href", "ngbTooltip"], ["fontIcon", "question_mark"]],
  template: function SeasonsComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Seasons");
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 1)(3, "div", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](4, SeasonsComponent_a_4_Template, 2, 5, "a", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](5, SeasonsComponent_div_5_Template, 6, 2, "div", 4);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.reverseSeasons);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.years);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterLink, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_4__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__.MatIcon],
  styles: [".season-icon[_ngcontent-%COMP%] {\n  width: var(--item-size);\n  height: var(--item-size);\n}\n.season-icon-medium[_ngcontent-%COMP%] {\n  width: var(--item-size-medium);\n  height: var(--item-size-medium);\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9zZWFzb25zL3NlYXNvbnMuY29tcG9uZW50Lmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSx1QkFBQTtFQUNBLHdCQUFBO0FBQ0Y7QUFFQTtFQUNFLDhCQUFBO0VBQ0EsK0JBQUE7QUFBRiIsInNvdXJjZXNDb250ZW50IjpbIi5zZWFzb24taWNvbiB7XG4gIHdpZHRoOiB2YXIoLS1pdGVtLXNpemUpO1xuICBoZWlnaHQ6IHZhcigtLWl0ZW0tc2l6ZSk7XG59XG5cbi5zZWFzb24taWNvbi1tZWRpdW0ge1xuICB3aWR0aDogdmFyKC0taXRlbS1zaXplLW1lZGl1bSk7XG4gIGhlaWdodDogdmFyKC0taXRlbS1zaXplLW1lZGl1bSk7XG59XG5cbi53cmFwcGVyLXllYXIge1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ== */"]
});

/***/ }),

/***/ 3975:
/*!*****************************************************!*\
  !*** ./src/app/components/shops/shops.component.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ShopsComponent": () => (/* binding */ ShopsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var src_app_services_iap_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/iap.service */ 5699);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _item_item_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../item/item.component */ 9348);







function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_span_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const shop_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](shop_r2.name);
  }
}
function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_span_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "Premium Candle Store");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
}
function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_span_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const shop_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3).$implicit;
    let tmp_0_0;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"]((tmp_0_0 = shop_r2.name) !== null && tmp_0_0 !== undefined ? tmp_0_0 : shop_r2.spirit == null ? null : shop_r2.spirit.name);
  }
}
function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_13_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "mat-icon", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "span", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const iap_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Regular candles");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", iap_r5.c, " ");
  }
}
function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_13_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "mat-icon", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "span", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const iap_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Season candles");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", iap_r5.sc, " ");
  }
}
function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_13_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "mat-icon", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "span", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const iap_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Gift Season Pass");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", iap_r5.sp, " ");
  }
}
function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_13_ng_container_1_Template, 4, 2, "ng-container", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_13_ng_container_2_Template, 4, 2, "ng-container", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](3, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_13_ng_container_3_Template, 4, 2, "ng-container", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const iap_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", iap_r5.c);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", iap_r5.sc);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", iap_r5.sp);
  }
}
function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_15_ng_template_3_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const item_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](item_r20.name);
  }
}
function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_15_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](0, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_15_ng_template_3_ng_container_0_Template, 3, 1, "ng-container", 1);
  }
  if (rf & 2) {
    const item_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", item_r20);
  }
}
function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r28 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_15_Template_div_click_0_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r28);
      const iap_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
      const ctx_r26 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](4);
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r26.togglePurchased($event, iap_r5));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "app-item", 19)(2, "mat-icon", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](3, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_15_ng_template_3_Template, 1, 1, "ng-template", null, 21, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const item_r20 = ctx.$implicit;
    const _r21 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵreference"](4);
    const iap_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("item", item_r20)("ngbTooltip", _r21);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("unlocked", iap_r5.bought || (item_r20 == null ? null : item_r20.unlocked))("self", iap_r5.bought);
  }
}
function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 5)(1, "h3", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](4, "mat-icon", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "span", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](6, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_span_6_Template, 2, 1, "span", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](7, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_span_7_Template, 2, 0, "span", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](8, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_span_8_Template, 2, 1, "span", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](9, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](10, "mat-icon", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](11, "span", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](13, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_13_Template, 4, 3, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](15, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_div_15_Template, 5, 6, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const iap_r5 = ctx.$implicit;
    const shop_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", iap_r5.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", iap_r5.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("fontIcon", "location_on");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", shop_r2.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", !shop_r2.name && shop_r2.type === "Store");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", !shop_r2.name && shop_r2.type !== "Store");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngbTooltip", "Price of the IAP in USD.");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", iap_r5.price, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", iap_r5.c || iap_r5.sc || iap_r5.sp);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", iap_r5.items);
  }
}
function ShopsComponent_ng_container_2_ng_container_2_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_div_1_Template, 16, 10, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const shop_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", shop_r2.iaps);
  }
}
function ShopsComponent_ng_container_2_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, ShopsComponent_ng_container_2_ng_container_2_ng_container_1_Template, 2, 1, "ng-container", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const shop_r2 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", shop_r2.iaps == null ? null : shop_r2.iaps.length);
  }
}
function ShopsComponent_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, ShopsComponent_ng_container_2_ng_container_2_Template, 2, 1, "ng-container", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r0.shops);
  }
}
class ShopsComponent {
  constructor(_dataService, _iapService) {
    this._dataService = _dataService;
    this._iapService = _iapService;
    this.shops = this._dataService.shopConfig.items.filter(s => s.permanent);
  }
  togglePurchased(event, iap) {
    this._iapService.togglePurchased(iap);
  }
}
ShopsComponent.ɵfac = function ShopsComponent_Factory(t) {
  return new (t || ShopsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__.DataService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](src_app_services_iap_service__WEBPACK_IMPORTED_MODULE_1__.IAPService));
};
ShopsComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
  type: ShopsComponent,
  selectors: [["app-shops"]],
  decls: 3,
  vars: 1,
  consts: [[1, "h2"], [4, "ngIf"], [1, "card-grid", "card-grid-4", "mt-2"], [4, "ngFor", "ngForOf"], ["class", "card p-rel", 4, "ngFor", "ngForOf"], [1, "card", "p-rel"], ["container", "body", 1, "h4", 3, "ngbTooltip"], [1, "mt-2", "item"], [1, "menu-icon", 3, "fontIcon"], [1, "menu-label"], ["fontIcon", "attach_money", 1, "menu-icon"], ["container", "body", 1, "menu-label", 3, "ngbTooltip"], ["class", "mt-2 item", 4, "ngIf"], [1, "mt-2", "item", "iap-items"], ["class", "iap-item point d-inline-block p-rel", 3, "click", 4, "ngFor", "ngForOf"], ["svgIcon", "candle", "container", "body", "placement", "right", 1, "menu-icon", 3, "ngbTooltip"], ["svgIcon", "season-candle", "container", "body", "placement", "right", 1, "menu-icon", 3, "ngbTooltip"], ["svgIcon", "gift", "container", "body", "placement", "right", 1, "menu-icon", "seasonal", 3, "ngbTooltip"], [1, "iap-item", "point", "d-inline-block", "p-rel", 3, "click"], ["placement", "bottom", "container", "body", 3, "item", "ngbTooltip"], ["fontIcon", "done", 1, "unlock-check"], ["itemHover", ""], [1, "ws-nw"]],
  template: function ShopsComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "Permanent In-App Purchases");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, ShopsComponent_ng_container_2_Template, 3, 1, "ng-container", 1);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.shops == null ? null : ctx.shops.length);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_4__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_4__.NgIf, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_5__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__.MatIcon, _item_item_component__WEBPACK_IMPORTED_MODULE_2__.ItemComponent],
  styles: ["\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZVJvb3QiOiIifQ== */"]
});

/***/ }),

/***/ 5985:
/*!*****************************************************************!*\
  !*** ./src/app/components/spirit-tree/spirit-tree.component.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SpiritTreeComponent": () => (/* binding */ SpiritTreeComponent)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 116);
/* harmony import */ var src_app_helpers_cost_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/helpers/cost-helper */ 999);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_event_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/event.service */ 9426);
/* harmony import */ var src_app_services_storage_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/storage.service */ 1188);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _node_node_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../node/node.component */ 4893);









function SpiritTreeComponent_div_6_app_node_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "app-node", 17);
  }
  if (rf & 2) {
    const node_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("node", node_r8)("position", "left");
  }
}
function SpiritTreeComponent_div_6_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "div", 18);
  }
}
function SpiritTreeComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, SpiritTreeComponent_div_6_app_node_1_Template, 1, 2, "app-node", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, SpiritTreeComponent_div_6_div_2_Template, 1, 0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const node_r8 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", node_r8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", node_r8 == null ? null : node_r8.n);
  }
}
function SpiritTreeComponent_div_8_app_node_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "app-node", 17);
  }
  if (rf & 2) {
    const node_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("node", node_r12)("position", "center");
  }
}
function SpiritTreeComponent_div_8_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "div", 21);
  }
}
function SpiritTreeComponent_div_8_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "div", 18);
  }
}
function SpiritTreeComponent_div_8_div_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "div", 22);
  }
}
function SpiritTreeComponent_div_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, SpiritTreeComponent_div_8_app_node_1_Template, 1, 2, "app-node", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, SpiritTreeComponent_div_8_div_2_Template, 1, 0, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](3, SpiritTreeComponent_div_8_div_3_Template, 1, 0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](4, SpiritTreeComponent_div_8_div_4_Template, 1, 0, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const node_r12 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", node_r12);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", node_r12 == null ? null : node_r12.nw);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", node_r12 == null ? null : node_r12.n);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", node_r12 == null ? null : node_r12.ne);
  }
}
function SpiritTreeComponent_div_10_app_node_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "app-node", 17);
  }
  if (rf & 2) {
    const node_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("node", node_r18)("position", "right");
  }
}
function SpiritTreeComponent_div_10_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "div", 18);
  }
}
function SpiritTreeComponent_div_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, SpiritTreeComponent_div_10_app_node_1_Template, 1, 2, "app-node", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, SpiritTreeComponent_div_10_div_2_Template, 1, 0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const node_r18 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", node_r18);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", node_r18 == null ? null : node_r18.n);
  }
}
function SpiritTreeComponent_div_12_span_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("(", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind2"](2, 1, ctx_r22.tsDate, "dd-MM-yyyy"), ")");
  }
}
function SpiritTreeComponent_div_12_span_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r23 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("(", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind2"](2, 1, ctx_r23.rsDate, "dd-MM-yyyy"), ")");
  }
}
function SpiritTreeComponent_div_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵprojection"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](4, SpiritTreeComponent_div_12_span_4_Template, 3, 4, "span", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](5, SpiritTreeComponent_div_12_span_5_Template, 3, 4, "span", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r3.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r3.tsDate);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r3.rsDate);
  }
}
function SpiritTreeComponent_div_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "div", 27);
  }
}
function SpiritTreeComponent_div_14_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "span", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](4, "mat-icon", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r24.totalCost.c, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("(", ctx_r24.remainingCost.c || 0, ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("inline", false);
  }
}
function SpiritTreeComponent_div_14_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "span", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](4, "mat-icon", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r25.totalCost.sc, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("(", ctx_r25.remainingCost.sc || 0, ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("inline", false);
  }
}
function SpiritTreeComponent_div_14_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "span", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](4, "mat-icon", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r26 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r26.totalCost.h, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("(", ctx_r26.remainingCost.h || 0, ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("inline", false);
  }
}
function SpiritTreeComponent_div_14_div_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "span", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](4, "mat-icon", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r27 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r27.totalCost.sh, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("(", ctx_r27.remainingCost.sh || 0, ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("inline", false);
  }
}
function SpiritTreeComponent_div_14_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "span", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](4, "mat-icon", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r28.totalCost.ac, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("(", ctx_r28.remainingCost.ac || 0, ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("inline", false);
  }
}
function SpiritTreeComponent_div_14_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, SpiritTreeComponent_div_14_div_1_Template, 5, 3, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, SpiritTreeComponent_div_14_div_2_Template, 5, 3, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](3, SpiritTreeComponent_div_14_div_3_Template, 5, 3, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](4, SpiritTreeComponent_div_14_div_4_Template, 5, 3, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](5, SpiritTreeComponent_div_14_div_5_Template, 5, 3, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵreference"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngbTooltip", _r6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r5.totalCost == null ? null : ctx_r5.totalCost.c);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r5.totalCost == null ? null : ctx_r5.totalCost.sc);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r5.totalCost == null ? null : ctx_r5.totalCost.h);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r5.totalCost == null ? null : ctx_r5.totalCost.sh);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r5.totalCost == null ? null : ctx_r5.totalCost.ac);
  }
}
function SpiritTreeComponent_ng_template_15_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, "Total cost of all the items in this tree.");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](2, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "span", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4, "Remaining cost of items not yet unlocked.");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
}
const _c0 = [[["div", "name", ""]]];
const _c1 = ["div[name]"];
class SpiritTreeComponent {
  constructor(_eventService, _storageService, _elementRef) {
    this._eventService = _eventService;
    this._storageService = _storageService;
    this._elementRef = _elementRef;
    this.nodes = [];
    this.left = [];
    this.center = [];
    this.right = [];
    this.hasCostAtRoot = false;
    this.itemMap = new Map();
  }
  ngAfterViewInit() {
    const element = this._elementRef.nativeElement;
    const scrollElem = element.querySelector('.spirit-tree-scroll');
    if (scrollElem) {
      scrollElem.scrollTop = 1000;
    }
  }
  ngOnChanges(changes) {
    if (changes['tree']) {
      this.initializeNodes();
      this.subscribeItemChanged();
      this.calculateRemainingCosts();
      this.tsDate = this.tree.ts?.date instanceof Date ? this.tree.ts.date : undefined;
      this.rsDate = this.tree.visit?.return?.date instanceof Date ? this.tree.visit.return.date : undefined;
    }
  }
  ngOnDestroy() {
    this._itemSub?.unsubscribe();
  }
  /** Build grid from nodes. */
  initializeNodes() {
    // Reset data
    this.itemMap.clear();
    this.totalCost = {
      c: 0,
      h: 0,
      sc: 0,
      sh: 0,
      ac: 0
    };
    this.remainingCost = {
      c: 0,
      h: 0,
      sc: 0,
      sh: 0,
      ac: 0
    };
    this.nodes = [];
    this.left = [];
    this.center = [];
    this.right = [];
    this.hasCost = false;
    if (!this.tree) {
      return;
    }
    this.initializeNode(this.tree.node, 0, 0);
    this.hasCost = !src_app_helpers_cost_helper__WEBPACK_IMPORTED_MODULE_0__.CostHelper.isEmpty(this.totalCost);
    this.hasCostAtRoot = !src_app_helpers_cost_helper__WEBPACK_IMPORTED_MODULE_0__.CostHelper.isEmpty(this.tree.node);
  }
  subscribeItemChanged() {
    this._itemSub?.unsubscribe();
    this._itemSub = this._eventService.itemToggled.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_5__.filter)(v => this.itemMap.has(v.guid))).subscribe(v => this.onItemChanged(v));
  }
  onItemChanged(item) {
    const node = this.itemMap.get(item.guid);
    if (!node) {
      return;
    }
    this.calculateRemainingCosts();
  }
  initializeNode(node, direction, level) {
    // Save item guid to detect updates
    if (node.item) {
      this.itemMap.set(node.item.guid, node);
    }
    this.nodes.push(node);
    const arr = direction < 0 ? this.left : direction > 0 ? this.right : this.center;
    arr[level] = node;
    // Add costs to total
    if (node.c) {
      this.totalCost.c += node.c;
    }
    ;
    if (node.h) {
      this.totalCost.h += node.h;
    }
    ;
    if (node.sc) {
      this.totalCost.sc += node.sc;
    }
    ;
    if (node.sh) {
      this.totalCost.sh += node.sh;
    }
    ;
    if (node.ac) {
      this.totalCost.ac += node.ac;
    }
    ;
    if (node.nw) {
      this.initializeNode(node.nw, direction - 1, level);
    }
    if (node.ne) {
      this.initializeNode(node.ne, direction + 1, level);
    }
    if (node.n) {
      this.initializeNode(node.n, direction, level + 1);
    }
  }
  calculateRemainingCosts() {
    this.remainingCost = {};
    this.nodes.filter(n => !n.unlocked && !n.item?.unlocked).forEach(n => {
      src_app_helpers_cost_helper__WEBPACK_IMPORTED_MODULE_0__.CostHelper.add(this.remainingCost, n);
    });
  }
  unlockAll() {
    const itemNodes = this.nodes.filter(n => n.item);
    const items = itemNodes.map(n => n.item);
    const shouldUnlock = items.filter(v => !v.unlocked).length;
    const msg = `Are you sure you want to ${shouldUnlock ? 'UNLOCK' : 'REMOVE'} all items from this tree?`;
    if (!confirm(msg)) {
      return;
    }
    if (shouldUnlock) {
      // Unlock all locked items.
      itemNodes.filter(n => !n.item.unlocked).forEach(node => {
        node.item.unlocked = true;
        node.unlocked = true;
        this._storageService.add(node.item.guid, node.guid);
        this._eventService.toggleItem(node.item);
      });
    } else {
      // Lock all unlocked items.
      itemNodes.filter(n => n.item.unlocked).forEach(node => {
        node.item.unlocked = false;
        const refNodes = node.item.nodes || [];
        refNodes.forEach(n => n.unlocked = false);
        this._storageService.remove(node.item.guid, ...refNodes.map(n => n.guid));
        this._eventService.toggleItem(node.item);
      });
    }
    this._storageService.save();
  }
}
SpiritTreeComponent.ɵfac = function SpiritTreeComponent_Factory(t) {
  return new (t || SpiritTreeComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](src_app_services_event_service__WEBPACK_IMPORTED_MODULE_1__.EventService), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](src_app_services_storage_service__WEBPACK_IMPORTED_MODULE_2__.StorageService), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_4__.ElementRef));
};
SpiritTreeComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({
  type: SpiritTreeComponent,
  selectors: [["app-spirit-tree"]],
  inputs: {
    tree: "tree",
    name: "name",
    highlight: "highlight"
  },
  features: [_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵNgOnChangesFeature"]],
  ngContentSelectors: _c1,
  decls: 17,
  vars: 11,
  consts: [[1, "content"], [1, "spirit-tree-scroll"], ["container", "body", "placement", "bottom-end", 1, "unlock-all", 3, "ngbTooltip", "click"], ["fontIcon", "lock_open"], [1, "spirit-tree"], [1, "column", "left"], ["class", "item", 4, "ngFor", "ngForOf"], [1, "column", "center"], [1, "column", "right"], [1, "footer"], ["class", "name", 4, "ngIf"], ["class", "hr", 4, "ngIf"], ["class", "costs", "container", "body", "placement", "top", 3, "ngbTooltip", 4, "ngIf"], ["costHover", ""], [1, "item"], [3, "node", "position", 4, "ngIf"], ["class", "arrow arrow-up", 4, "ngIf"], [3, "node", "position"], [1, "arrow", "arrow-up"], ["class", "arrow arrow-left", 4, "ngIf"], ["class", "arrow arrow-right", 4, "ngIf"], [1, "arrow", "arrow-left"], [1, "arrow", "arrow-right"], [1, "name"], [1, "name-default"], ["class", "c-accent ts-date", 4, "ngIf"], [1, "c-accent", "ts-date"], [1, "hr"], ["container", "body", "placement", "top", 1, "costs", 3, "ngbTooltip"], ["class", "cost", 4, "ngIf"], ["class", "cost seasonal", 4, "ngIf"], ["class", "cost ascend", 4, "ngIf"], [1, "cost"], [1, "remaining-cost"], ["svgIcon", "candle", 3, "inline"], [1, "cost", "seasonal"], ["svgIcon", "heart", 3, "inline"], [1, "cost", "ascend"], ["svgIcon", "ascended-candle", 3, "inline"]],
  template: function SpiritTreeComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵprojectionDef"](_c0);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "div", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function SpiritTreeComponent_Template_div_click_2_listener() {
        return ctx.unlockAll();
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](3, "mat-icon", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "div", 4)(5, "div", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, SpiritTreeComponent_div_6_Template, 3, 2, "div", 6);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "div", 7);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](8, SpiritTreeComponent_div_8_Template, 5, 4, "div", 6);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "div", 8);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](10, SpiritTreeComponent_div_10_Template, 3, 2, "div", 6);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](11, "div", 9);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](12, SpiritTreeComponent_div_12_Template, 6, 3, "div", 10);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](13, SpiritTreeComponent_div_13_Template, 1, 0, "div", 11);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](14, SpiritTreeComponent_div_14_Template, 6, 6, "div", 12);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](15, SpiritTreeComponent_ng_template_15_Template, 5, 0, "ng-template", null, 13, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplateRefExtractor"]);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("highlight", ctx.highlight);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("pad-bottom", ctx.hasCostAtRoot);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngbTooltip", "Toggle all");
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.left);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.center);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.right);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.name);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.name && ctx.hasCost);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.hasCost);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_6__.NgIf, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_7__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_8__.MatIcon, _node_node_component__WEBPACK_IMPORTED_MODULE_3__.NodeComponent, _angular_common__WEBPACK_IMPORTED_MODULE_6__.DatePipe],
  styles: ["[_nghost-%COMP%] {\n  display: inline-block;\n}\n.content[_ngcontent-%COMP%] {\n  border: 1px solid var(--color-item-background);\n  border-radius: var(--border-radius-round);\n  overflow: hidden;\n}\n.content.highlight[_ngcontent-%COMP%] {\n  border-color: var(--color-border-complement);\n}\n.spirit-tree-scroll[_ngcontent-%COMP%] {\n  position: relative;\n  overflow-y: auto;\n  padding-top: 20px;\n}\n.spirit-tree-scroll.pad-bottom[_ngcontent-%COMP%] {\n  padding-bottom: 32px;\n}\n\n.spirit-tree[_ngcontent-%COMP%] {\n  display: inline-flex;\n  gap: 32px;\n  width: min-content;\n  padding: 4px 4px 4px 4px;\n}\n\n.column[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 40px;\n  flex-direction: column-reverse;\n  justify-content: flex-start;\n  counter-reset: item-counter;\n  width: var(--item-size);\n}\n.left[_ngcontent-%COMP%], .right[_ngcontent-%COMP%] {\n  padding-bottom: 48px;\n}\n.item[_ngcontent-%COMP%] {\n  position: relative;\n  width: var(--item-size);\n  height: var(--item-size);\n}\n.arrow[_ngcontent-%COMP%] {\n  position: absolute;\n  background: var(--color);\n  width: 1px;\n}\n.arrow-left[_ngcontent-%COMP%] {\n  transform: rotate(-45deg);\n  height: 32px;\n  left: -18px;\n  top: 0;\n}\n.arrow-up[_ngcontent-%COMP%] {\n  height: 24px;\n  top: -30px;\n  left: 50%;\n  transform: translateX(-50%);\n}\n.arrow-right[_ngcontent-%COMP%] {\n  transform: rotate(45deg);\n  height: 32px;\n  right: -18px;\n  top: 0;\n}\n\n.footer[_ngcontent-%COMP%] {\n  text-align: center;\n  background: var(--color-item-background);\n}\n.name[_ngcontent-%COMP%] {\n  padding: 4px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  vertical-align: bottom;\n}\n.name-default[_ngcontent-%COMP%]:not(:only-child) {\n  display: none;\n}\n.ts-date[_ngcontent-%COMP%] {\n  font-size: 13px;\n  vertical-align: text-bottom;\n}\n.hr[_ngcontent-%COMP%] {\n  --width: calc(100% - 20px);\n  height: 1px;\n  width: var(--width);\n  margin-left: calc((100% - var(--width)) / 2);\n  background: var(--color-border-highlight);\n}\n.costs[_ngcontent-%COMP%] {\n  padding: 4px;\n}\n.cost[_ngcontent-%COMP%] {\n  display: inline-block;\n  font-size: 14px;\n  padding: 0 6px;\n}\n.cost[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  width: 17px;\n  vertical-align: sub;\n  height: auto;\n}\n.remaining-cost[_ngcontent-%COMP%] {\n  color: var(--color-accent);\n}\n.seasonal[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  fill: var(--color-seasonal);\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9zcGlyaXQtdHJlZS9zcGlyaXQtdHJlZS5jb21wb25lbnQubGVzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLHFCQUFBO0FBQ0Y7QUFFQTtFQUNFLDhDQUFBO0VBQ0EseUNBQUE7RUFDQSxnQkFBQTtBQUFGO0FBR0E7RUFDRSw0Q0FBQTtBQURGO0FBSUE7RUFDRSxrQkFBQTtFQUVBLGdCQUFBO0VBQ0EsaUJBQUE7QUFIRjtBQU9BO0VBQ0Usb0JBQUE7QUFMRjtBQUNBLDRCQUE0QjtBQVE1QjtFQUNFLG9CQUFBO0VBQ0EsU0FBQTtFQUNBLGtCQUFBO0VBQ0Esd0JBQUE7QUFORjtBQUNBLDJCQUEyQjtBQVMzQjtFQUNFLGFBQUE7RUFDQSxTQUFBO0VBQ0EsOEJBQUE7RUFDQSwyQkFBQTtFQUNBLDJCQUFBO0VBQ0EsdUJBQUE7QUFQRjtBQVVBOztFQUNFLG9CQUFBO0FBUEY7QUFVQTtFQUNFLGtCQUFBO0VBQ0EsdUJBQUE7RUFDQSx3QkFBQTtBQVJGO0FBV0E7RUFDRSxrQkFBQTtFQUNBLHdCQUFBO0VBQ0EsVUFBQTtBQVRGO0FBWUE7RUFDRSx5QkFBQTtFQUNBLFlBQUE7RUFDQSxXQUFBO0VBQ0EsTUFBQTtBQVZGO0FBYUE7RUFDRSxZQUFBO0VBQ0EsVUFBQTtFQUNBLFNBQUE7RUFDQSwyQkFBQTtBQVhGO0FBY0E7RUFDRSx3QkFBQTtFQUNBLFlBQUE7RUFDQSxZQUFBO0VBQ0EsTUFBQTtBQVpGO0FBQ0EsV0FBVztBQWdCWDtFQUNFLGtCQUFBO0VBQ0Esd0NBQUE7QUFkRjtBQWlCQTtFQUNFLFlBQUE7RUFDQSxnQkFBQTtFQUNBLHVCQUFBO0VBQ0EsbUJBQUE7RUFDQSxzQkFBQTtBQWZGO0FBa0JBO0VBQ0UsYUFBQTtBQWhCRjtBQW1CQTtFQUNFLGVBQUE7RUFDQSwyQkFBQTtBQWpCRjtBQW9CQTtFQUNFLDBCQUFBO0VBQ0EsV0FBQTtFQUNBLG1CQUFBO0VBQ0EsNENBQUE7RUFDQSx5Q0FBQTtBQWxCRjtBQXFCQTtFQUNFLFlBQUE7QUFuQkY7QUFzQkE7RUFDRSxxQkFBQTtFQUNBLGVBQUE7RUFDQSxjQUFBO0FBcEJGO0FBc0JBO0VBQ0UsV0FBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtBQXBCRjtBQXVCQTtFQUNFLDBCQUFBO0FBckJGO0FBd0JBO0VBQXFCLDJCQUFBO0FBckJyQiIsInNvdXJjZXNDb250ZW50IjpbIjpob3N0IHtcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xufVxuXG4uY29udGVudCB7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLWl0ZW0tYmFja2dyb3VuZCk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtcm91bmQpO1xuICBvdmVyZmxvdzogaGlkZGVuO1xufVxuXG4uY29udGVudC5oaWdobGlnaHQge1xuICBib3JkZXItY29sb3I6IHZhcigtLWNvbG9yLWJvcmRlci1jb21wbGVtZW50KTtcbn1cblxuLnNwaXJpdC10cmVlLXNjcm9sbCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgLy8gbWF4LWhlaWdodDogNjAwcHg7XG4gIG92ZXJmbG93LXk6IGF1dG87XG4gIHBhZGRpbmctdG9wOiAyMHB4O1xufVxuXG4vLyBBZGQgc3BhY2UgYXQgYm90dG9tIGZvciBub2RlIGNvc3QuXG4uc3Bpcml0LXRyZWUtc2Nyb2xsLnBhZC1ib3R0b20ge1xuICBwYWRkaW5nLWJvdHRvbTogMzJweDtcbn1cblxuLyoqIENvbnRhaW5zIHRoZSAzIGNvbHVtbnMgKi9cbi5zcGlyaXQtdHJlZSB7XG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICBnYXA6IDMycHg7XG4gIHdpZHRoOiBtaW4tY29udGVudDtcbiAgcGFkZGluZzogNHB4IDRweCA0cHggNHB4O1xufVxuXG4vKiogQ29udGFpbnMgY29sdW1uIG5vZGVzICovXG4uY29sdW1uIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZ2FwOiA0MHB4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uLXJldmVyc2U7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbiAgY291bnRlci1yZXNldDogaXRlbS1jb3VudGVyO1xuICB3aWR0aDogdmFyKC0taXRlbS1zaXplKTtcbn1cblxuLmxlZnQsIC5yaWdodCB7XG4gIHBhZGRpbmctYm90dG9tOiA0OHB4O1xufVxuXG4uaXRlbSB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgd2lkdGg6IHZhcigtLWl0ZW0tc2l6ZSk7XG4gIGhlaWdodDogdmFyKC0taXRlbS1zaXplKTtcbn1cblxuLmFycm93IHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvcik7XG4gIHdpZHRoOiAxcHg7XG59XG5cbi5hcnJvdy1sZWZ0IHtcbiAgdHJhbnNmb3JtOiByb3RhdGUoLTQ1ZGVnKTtcbiAgaGVpZ2h0OiAzMnB4O1xuICBsZWZ0OiAtMThweDtcbiAgdG9wOiAwO1xufVxuXG4uYXJyb3ctdXAge1xuICBoZWlnaHQ6IDI0cHg7XG4gIHRvcDogLTMwcHg7XG4gIGxlZnQ6IDUwJTtcbiAgdHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSk7XG59XG5cbi5hcnJvdy1yaWdodCB7XG4gIHRyYW5zZm9ybTogcm90YXRlKDQ1ZGVnKTtcbiAgaGVpZ2h0OiAzMnB4O1xuICByaWdodDogLTE4cHg7XG4gIHRvcDogMDtcbn1cblxuLyogRm9vdGVyICovXG5cbi5mb290ZXIge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIGJhY2tncm91bmQ6IHZhcigtLWNvbG9yLWl0ZW0tYmFja2dyb3VuZCk7XG59XG5cbi5uYW1lIHtcbiAgcGFkZGluZzogNHB4O1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgdmVydGljYWwtYWxpZ246IGJvdHRvbTtcbn1cblxuLm5hbWUtZGVmYXVsdDpub3QoOm9ubHktY2hpbGQpIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuLnRzLWRhdGUge1xuICBmb250LXNpemU6IDEzcHg7XG4gIHZlcnRpY2FsLWFsaWduOiB0ZXh0LWJvdHRvbTtcbn1cblxuLmhyIHtcbiAgLS13aWR0aDogY2FsYygxMDAlIC0gMjBweCk7XG4gIGhlaWdodDogMXB4O1xuICB3aWR0aDogdmFyKC0td2lkdGgpO1xuICBtYXJnaW4tbGVmdDogY2FsYygoMTAwJSAtIHZhcigtLXdpZHRoKSkgLyAyKTtcbiAgYmFja2dyb3VuZDogdmFyKC0tY29sb3ItYm9yZGVyLWhpZ2hsaWdodCk7XG59XG5cbi5jb3N0cyB7XG4gIHBhZGRpbmc6IDRweDtcbn1cblxuLmNvc3Qge1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gIGZvbnQtc2l6ZTogMTRweDtcbiAgcGFkZGluZzogMCA2cHg7XG59XG4uY29zdCBtYXQtaWNvbiB7XG4gIHdpZHRoOiAxN3B4O1xuICB2ZXJ0aWNhbC1hbGlnbjogc3ViO1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi5yZW1haW5pbmctY29zdCB7XG4gIGNvbG9yOiB2YXIoLS1jb2xvci1hY2NlbnQpO1xufVxuXG4uc2Vhc29uYWwgbWF0LWljb24geyBmaWxsOiB2YXIoLS1jb2xvci1zZWFzb25hbCk7IH1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
});

/***/ }),

/***/ 8540:
/*!*******************************************************!*\
  !*** ./src/app/components/spirit/spirit.component.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SpiritComponent": () => (/* binding */ SpiritComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _spirit_tree_spirit_tree_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../spirit-tree/spirit-tree.component */ 5985);






function SpiritComponent_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 10)(1, "a", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](2, "mat-icon", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("href", ctx_r0.spirit._wiki.href, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsanitizeUrl"]);
  }
}
function SpiritComponent_div_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "app-spirit-tree", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("tree", ctx_r1.tree)("name", "Spirit tree")("highlight", false);
  }
}
function SpiritComponent_app_spirit_tree_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](0, "app-spirit-tree", 13);
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("tree", ctx_r2.spirit.tree)("name", "Spirit tree")("highlight", ctx_r2.highlightTree === ctx_r2.spirit.tree.guid);
  }
}
function SpiritComponent_ng_container_11_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](2, "app-spirit-tree", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ts_r6 = ctx.$implicit;
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("tree", ts_r6.tree)("name", "Traveling Spirit #" + ts_r6.number)("highlight", ctx_r5.highlightTree === ts_r6.tree.guid);
  }
}
function SpiritComponent_ng_container_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](1, SpiritComponent_ng_container_11_ng_container_1_Template, 3, 3, "ng-container", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx_r3.spirit.ts);
  }
}
function SpiritComponent_ng_container_12_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](2, "app-spirit-tree", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const visit_r9 = ctx.$implicit;
    const vi_r10 = ctx.index;
    const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("tree", visit_r9.tree)("name", visit_r9.return.name || "Visit #" + (vi_r10 + 1))("highlight", ctx_r8.highlightTree === visit_r9.tree.guid);
  }
}
function SpiritComponent_ng_container_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](1, SpiritComponent_ng_container_12_ng_container_1_Template, 3, 3, "ng-container", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx_r4.spirit.returns);
  }
}
class SpiritComponent {
  constructor(_dataService, _route) {
    this._dataService = _dataService;
    this._route = _route;
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }
  onQueryChanged(p) {
    this.highlightTree = p.get('highlightTree') || undefined;
    // Add tree from query (i.e. event spirit).
    const addTree = p.get('tree') || undefined;
    if (addTree) {
      this.tree = this._dataService.guidMap.get(addTree);
    }
  }
  onParamsChanged(params) {
    const guid = params.get('guid');
    this.spirit = this._dataService.guidMap.get(guid);
  }
}
SpiritComponent.ɵfac = function SpiritComponent_Factory(t) {
  return new (t || SpiritComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__.DataService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__.ActivatedRoute));
};
SpiritComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({
  type: SpiritComponent,
  selectors: [["app-spirit"]],
  decls: 13,
  vars: 6,
  consts: [[1, "h2"], [1, "card-wrapper", "mt-2"], [1, "h3", "mb-0"], ["class", "wiki", 4, "ngIf"], [1, "card-container", "mt-2"], [1, "card-container-inner"], ["class", "tree-wrapper p-inline-block", 4, "ngIf"], [1, "tree-wrapper", "p-inline-block"], [3, "tree", "name", "highlight", 4, "ngIf"], [4, "ngIf"], [1, "wiki"], ["target", "_blank", 3, "href"], ["fontIcon", "question_mark"], [3, "tree", "name", "highlight"], [4, "ngFor", "ngForOf"]],
  template: function SpiritComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, "Spirit");
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](2, "div", 1)(3, "h2", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](5, SpiritComponent_div_5_Template, 3, 1, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](6, "div", 4)(7, "div", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](8, SpiritComponent_div_8_Template, 2, 3, "div", 6);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "div", 7);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](10, SpiritComponent_app_spirit_tree_10_Template, 1, 3, "app-spirit-tree", 8);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](11, SpiritComponent_ng_container_11_Template, 2, 1, "ng-container", 9);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](12, SpiritComponent_ng_container_12_Template, 2, 1, "ng-container", 9);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate"](ctx.spirit.name);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.spirit._wiki == null ? null : ctx.spirit._wiki.href);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.tree);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.spirit.tree);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.spirit.ts);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.spirit.returns);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_4__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_4__.NgIf, _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__.MatIcon, _spirit_tree_spirit_tree_component__WEBPACK_IMPORTED_MODULE_1__.SpiritTreeComponent],
  styles: [".tree-wrapper[_ngcontent-%COMP%]   app-spirit-tree[_ngcontent-%COMP%] {\n  vertical-align: bottom;\n}\n.wiki[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 28px;\n  height: 28px;\n  top: 50%;\n  transform: translateY(-50%);\n  right: var(--padding-content);\n  border-radius: var(--border-radius-round);\n  background: var(--color-background);\n}\n.wiki[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 1px;\n  right: 3px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9zcGlyaXQvc3Bpcml0LmNvbXBvbmVudC5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0Usc0JBQUE7QUFDRjtBQUVBO0VBQ0Usa0JBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtFQUNBLFFBQUE7RUFDQSwyQkFBQTtFQUNBLDZCQUFBO0VBRUEseUNBQUE7RUFDQSxtQ0FBQTtBQURGO0FBUkE7RUFZSSxrQkFBQTtFQUNBLFFBQUE7RUFDQSxVQUFBO0FBREoiLCJzb3VyY2VzQ29udGVudCI6WyIudHJlZS13cmFwcGVyIGFwcC1zcGlyaXQtdHJlZSB7XG4gIHZlcnRpY2FsLWFsaWduOiBib3R0b207XG59XG5cbi53aWtpIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB3aWR0aDogMjhweDtcbiAgaGVpZ2h0OiAyOHB4O1xuICB0b3A6IDUwJTtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpO1xuICByaWdodDogdmFyKC0tcGFkZGluZy1jb250ZW50KTtcblxuICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLXJvdW5kKTtcbiAgYmFja2dyb3VuZDogdmFyKC0tY29sb3ItYmFja2dyb3VuZCk7XG5cbiAgbWF0LWljb24ge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0b3A6IDFweDtcbiAgICByaWdodDogM3B4O1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
});

/***/ }),

/***/ 7912:
/*!*********************************************************!*\
  !*** ./src/app/components/spirits/spirits.component.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SpiritsComponent": () => (/* binding */ SpiritsComponent)
/* harmony export */ });
/* harmony import */ var src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/helpers/node-helper */ 1752);
/* harmony import */ var src_app_helpers_spirit_helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/helpers/spirit-helper */ 7398);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _table_table_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../table/table.component */ 9767);
/* harmony import */ var _table_table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../table/table-column/table-column.directive */ 4085);
/* harmony import */ var _table_table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../table/table-column/table-header.directive */ 7397);
/* harmony import */ var _table_table_column_table_footer_directive__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../table/table-column/table-footer.directive */ 1964);












function SpiritsComponent_app_table_4_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0, "Spirit");
  }
}
function SpiritsComponent_app_table_4_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0, "Type");
  }
}
function SpiritsComponent_app_table_4_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0, "Location");
  }
}
function SpiritsComponent_app_table_4_ng_template_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0, "Unlocked");
  }
}
const _c0 = function (a1) {
  return ["/spirit", a1];
};
const _c1 = function (a0) {
  return {
    tree: a0
  };
};
function SpiritsComponent_app_table_4_ng_template_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "a", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r14 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](3, _c0, row_r14.guid))("queryParams", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](5, _c1, row_r14.tree));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](row_r14.name);
  }
}
function SpiritsComponent_app_table_4_ng_template_6_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainer"](0);
  }
}
const _c2 = function (a0) {
  return {
    row: a0
  };
};
function SpiritsComponent_app_table_4_ng_template_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](0, SpiritsComponent_app_table_4_ng_template_6_ng_container_0_Template, 1, 0, "ng-container", 11);
  }
  if (rf & 2) {
    const row_r15 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵreference"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngTemplateOutlet", _r2)("ngTemplateOutletContext", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](2, _c2, row_r15));
  }
}
function SpiritsComponent_app_table_4_ng_template_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "a", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r17 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("routerLink", undefined);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", row_r17.area == null ? null : row_r17.area.name, " ");
  }
}
function SpiritsComponent_app_table_4_ng_template_8_span_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("partial", row_r18.unlockedLast && row_r18.unlockedLast === row_r18.totalLast)("completed", row_r18.unlockedItems === row_r18.totalItems);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngbTooltip", row_r18.unlockTooltip);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate2"](" ", row_r18.unlockedItems, " / ", row_r18.totalItems, " ");
  }
}
function SpiritsComponent_app_table_4_ng_template_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](0, SpiritsComponent_app_table_4_ng_template_8_span_0_Template, 2, 7, "span", 13);
  }
  if (rf & 2) {
    const row_r18 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", row_r18.totalItems);
  }
}
function SpiritsComponent_app_table_4_ng_template_9_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0, "Total:");
  }
}
function SpiritsComponent_app_table_4_ng_template_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("completed", ctx_r13.unlockedItems === ctx_r13.totalItems);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate2"]("", ctx_r13.unlockedItems, " / ", ctx_r13.totalItems, "");
  }
}
function SpiritsComponent_app_table_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "app-table", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](1, SpiritsComponent_app_table_4_ng_template_1_Template, 1, 0, "ng-template", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](2, SpiritsComponent_app_table_4_ng_template_2_Template, 1, 0, "ng-template", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, SpiritsComponent_app_table_4_ng_template_3_Template, 1, 0, "ng-template", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](4, SpiritsComponent_app_table_4_ng_template_4_Template, 1, 0, "ng-template", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](5, SpiritsComponent_app_table_4_ng_template_5_Template, 2, 7, "ng-template", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](6, SpiritsComponent_app_table_4_ng_template_6_Template, 1, 4, "ng-template", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](7, SpiritsComponent_app_table_4_ng_template_7_Template, 2, 2, "ng-template", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](8, SpiritsComponent_app_table_4_ng_template_8_Template, 1, 1, "ng-template", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](9, SpiritsComponent_app_table_4_ng_template_9_Template, 1, 0, "ng-template", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](10, SpiritsComponent_app_table_4_ng_template_10_Template, 2, 4, "ng-template", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("rows", ctx_r0.rows);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("colspan", 3)("textAlign", "right");
  }
}
function SpiritsComponent_div_5_div_1_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainer"](0);
  }
}
function SpiritsComponent_div_5_div_1_div_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 28)(1, "a", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](2, "mat-icon", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const row_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("href", row_r22._wiki.href, _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵsanitizeUrl"])("ngbTooltip", "Open wiki");
  }
}
function SpiritsComponent_div_5_div_1_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](1, "img", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("src", row_r22.imageUrl, _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵsanitizeUrl"]);
  }
}
function SpiritsComponent_div_5_div_1_span_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("partial", row_r22.unlockedLast && row_r22.unlockedLast === row_r22.totalLast)("completed", row_r22.unlockedItems === row_r22.totalItems);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngbTooltip", row_r22.unlockTooltip);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate2"](" ", row_r22.unlockedItems, " / ", row_r22.totalItems, " ");
  }
}
function SpiritsComponent_div_5_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 17)(1, "h2", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](2, SpiritsComponent_div_5_div_1_ng_container_2_Template, 1, 0, "ng-container", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](4, SpiritsComponent_div_5_div_1_div_4_Template, 3, 2, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](5, SpiritsComponent_div_5_div_1_div_5_Template, 2, 1, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](6, "a", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](7, "mat-icon", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9, "Information");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](11, "mat-icon", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](13, SpiritsComponent_div_5_div_1_span_13_Template, 2, 7, "span", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const row_r22 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵreference"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngTemplateOutlet", _r2)("ngTemplateOutletContext", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](8, _c2, row_r22));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", row_r22.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", row_r22._wiki == null ? null : row_r22._wiki.href);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", row_r22.imageUrl);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](10, _c0, row_r22.guid))("queryParams", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](12, _c1, row_r22.tree));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", row_r22.totalItems);
  }
}
function SpiritsComponent_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](1, SpiritsComponent_div_5_div_1_Template, 14, 14, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", ctx_r1.rows);
  }
}
function SpiritsComponent_ng_template_6_mat_icon_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](0, "mat-icon", 37);
  }
  if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("svgIcon", "ascended-candle")("ngbTooltip", "Elder Spirit");
  }
}
function SpiritsComponent_ng_template_6_mat_icon_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](0, "mat-icon", 37);
  }
  if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("svgIcon", "season-heart")("ngbTooltip", "Season Guide");
  }
}
function SpiritsComponent_ng_template_6_mat_icon_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](0, "mat-icon", 37);
  }
  if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("svgIcon", "candle")("ngbTooltip", "Regular Spirit");
  }
}
function SpiritsComponent_ng_template_6_mat_icon_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](0, "mat-icon", 37);
  }
  if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("svgIcon", "season-candle")("ngbTooltip", "Season Spirit");
  }
}
function SpiritsComponent_ng_template_6_span_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r30 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](row_r30.type);
  }
}
function SpiritsComponent_ng_template_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0, 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](1, SpiritsComponent_ng_template_6_mat_icon_1_Template, 1, 2, "mat-icon", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](2, SpiritsComponent_ng_template_6_mat_icon_2_Template, 1, 2, "mat-icon", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, SpiritsComponent_ng_template_6_mat_icon_3_Template, 1, 2, "mat-icon", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](4, SpiritsComponent_ng_template_6_mat_icon_4_Template, 1, 2, "mat-icon", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](5, SpiritsComponent_ng_template_6_span_5_Template, 2, 1, "span", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const row_r30 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngSwitch", row_r30.type);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngSwitchCase", "Elder");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngSwitchCase", "Guide");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngSwitchCase", "Regular");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngSwitchCase", "Season");
  }
}
class SpiritsComponent {
  constructor(_dataService, _route) {
    this._dataService = _dataService;
    this._route = _route;
    this.mode = 'cards';
    this.spirits = [];
    this.queryTree = {};
    this.spiritTrees = {};
    this.rows = [];
    this.unlockedItems = 0;
    this.totalItems = 0;
    this.mode = localStorage.getItem('spirits.mode') || 'grid';
    _route.queryParamMap.subscribe(q => {
      this.onQueryChanged(q);
    });
  }
  changeMode() {
    this.mode = this.mode === 'grid' ? 'cards' : 'grid';
    localStorage.setItem('spirits.mode', this.mode);
  }
  onQueryChanged(q) {
    this.spirits = [];
    this.spiritTrees = {};
    this.queryTree = {};
    // Filter by type
    const type = q.get('type');
    const typeSet = type ? new Set(type.split(',')) : undefined;
    const addSpirit = s => {
      // Don't add spirit if type is filtered out.
      if (typeSet && !typeSet.has(s.type)) {
        return false;
      }
      this.spirits.push(s);
      this.spiritTrees[s.guid] = src_app_helpers_spirit_helper__WEBPACK_IMPORTED_MODULE_1__.SpiritHelper.getTrees(s);
      return true;
    };
    // Load from realm.
    const realmGuid = q.get('realm');
    const realm = realmGuid ? this._dataService.guidMap.get(realmGuid) : undefined;
    realm?.areas?.forEach(a => a.spirits?.forEach(s => addSpirit(s)));
    // Load from season.
    const seasonGuid = q.get('season');
    const season = seasonGuid ? this._dataService.guidMap.get(seasonGuid) : undefined;
    season?.spirits?.forEach(s => addSpirit(s));
    this.initTable();
  }
  initTable() {
    this.unlockedItems = 0;
    this.totalItems = 0;
    this.rows = this.spirits.map(s => {
      // Count items from all spirit trees.
      let unlockedItems = 0,
        totalItems = 0;
      const trees = this.spiritTrees[s.guid];
      const itemSet = new Set();
      trees.forEach(tree => {
        // Get all nodes
        src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__.NodeHelper.getItems(tree.node).forEach(item => {
          if (itemSet.has(item)) {
            return;
          }
          itemSet.add(item);
          if (item.unlocked) {
            unlockedItems++;
          }
          totalItems++;
        });
      });
      // Count items from last spirit tree.
      let unlockedLast = 0,
        totalLast = 0;
      const lastTree = trees.at(-1);
      if (lastTree) {
        // Count items from last tree.
        src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__.NodeHelper.getItems(lastTree.node).forEach(item => {
          if (item.unlocked) {
            unlockedLast++;
          }
          totalLast++;
        });
      }
      const unlockTooltip = unlockedItems === totalItems ? 'All items unlocked.' : unlockedLast && unlockedLast === totalLast ? 'All items unlocked in most recent visit.' : undefined;
      this.unlockedItems += unlockedItems;
      this.totalItems += totalItems;
      return {
        ...s,
        areaGuid: s.area?.guid,
        tree: this.queryTree[s.guid]?.guid,
        unlockedItems,
        totalItems,
        unlockedLast,
        totalLast,
        unlockTooltip
      };
    });
  }
  onItemToggled(item) {
    /**/
  }
}
SpiritsComponent.ɵfac = function SpiritsComponent_Factory(t) {
  return new (t || SpiritsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_2__.DataService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_8__.ActivatedRoute));
};
SpiritsComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineComponent"]({
  type: SpiritsComponent,
  selectors: [["app-spirits"]],
  decls: 8,
  vars: 2,
  consts: [[1, "h2"], [1, "h6", "link", 3, "click"], [3, "rows", 4, "ngIf"], ["class", "card-grid card-grid-4 mt-2", 4, "ngIf"], ["type", ""], [3, "rows"], [3, "appTableHeader"], [3, "appTableColumn"], [3, "appTableFooter", "colspan", "textAlign"], [3, "appTableFooter"], [3, "routerLink", "queryParams"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], [3, "routerLink"], ["container", "body", "placement", "left", 3, "partial", "completed", "ngbTooltip", 4, "ngIf"], ["container", "body", "placement", "left", 3, "ngbTooltip"], [1, "card-grid", "card-grid-4", "mt-2"], ["class", "card p-rel", 4, "ngFor", "ngForOf"], [1, "card", "p-rel"], [1, "h3"], ["class", "wiki p-abs", 4, "ngIf"], ["class", "p-rel item spirit-img", 4, "ngIf"], [1, "mt-2", "item", "link", 3, "routerLink", "queryParams"], ["fontIcon", "list", 1, "menu-icon"], [1, "menu-label"], [1, "mt-2", "p-rel", "item"], ["fontIcon", "lock_open", 1, "menu-icon"], [1, "d-inline-block", "menu-label"], ["container", "body", "placement", "bottom", 3, "partial", "completed", "ngbTooltip", 4, "ngIf"], [1, "wiki", "p-abs"], ["target", "_blank", "placement", "left", "container", "body", 3, "href", "ngbTooltip"], ["fontIcon", "question_mark"], [1, "p-rel", "item", "spirit-img"], [3, "src"], ["container", "body", "placement", "bottom", 3, "ngbTooltip"], [3, "ngSwitch"], ["container", "body", "placement", "bottom", 3, "svgIcon", "ngbTooltip", 4, "ngSwitchCase"], [4, "ngSwitchDefault"], ["container", "body", "placement", "bottom", 3, "svgIcon", "ngbTooltip"]],
  template: function SpiritsComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1, " Spirits ");
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "a", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function SpiritsComponent_Template_a_click_2_listener() {
        return ctx.changeMode();
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](3, "Change view");
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](4, SpiritsComponent_app_table_4_Template, 11, 3, "app-table", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](5, SpiritsComponent_div_5_Template, 2, 1, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](6, SpiritsComponent_ng_template_6_Template, 6, 5, "ng-template", null, 4, _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplateRefExtractor"]);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.mode === "grid");
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.mode === "cards");
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_9__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgTemplateOutlet, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgSwitch, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgSwitchCase, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgSwitchDefault, _angular_router__WEBPACK_IMPORTED_MODULE_8__.RouterLink, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_10__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_11__.MatIcon, _table_table_component__WEBPACK_IMPORTED_MODULE_3__.TableComponent, _table_table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_4__.TableColumnDirective, _table_table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_5__.TableHeaderDirective, _table_table_column_table_footer_directive__WEBPACK_IMPORTED_MODULE_6__.TableFooterDirective],
  styles: [".partial[_ngcontent-%COMP%] {\n  color: var(--color-old);\n  font-weight: bold;\n}\n.completed[_ngcontent-%COMP%] {\n  color: var(--color-new);\n  font-weight: bold;\n}\n.spirit-img[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  padding: 0 10px;\n  width: auto;\n  height: 128px;\n  max-height: 128px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9zcGlyaXRzL3NwaXJpdHMuY29tcG9uZW50Lmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSx1QkFBQTtFQUNBLGlCQUFBO0FBQ0Y7QUFFQTtFQUNFLHVCQUFBO0VBQ0EsaUJBQUE7QUFBRjtBQUdBO0VBRUksZUFBQTtFQUNBLFdBQUE7RUFDQSxhQUFBO0VBQ0EsaUJBQUE7QUFGSiIsInNvdXJjZXNDb250ZW50IjpbIi5wYXJ0aWFsIHtcbiAgY29sb3I6IHZhcigtLWNvbG9yLW9sZCk7XG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xufVxuXG4uY29tcGxldGVkIHtcbiAgY29sb3I6IHZhcigtLWNvbG9yLW5ldyk7XG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xufVxuXG4uc3Bpcml0LWltZyB7XG4gIGltZyB7XG4gICAgcGFkZGluZzogMCAxMHB4O1xuICAgIHdpZHRoOiBhdXRvO1xuICAgIGhlaWdodDogMTI4cHg7XG4gICAgbWF4LWhlaWdodDogMTI4cHg7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
});

/***/ }),

/***/ 2592:
/*!***************************************************************!*\
  !*** ./src/app/components/status-bar/status-bar.component.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StatusBarComponent": () => (/* binding */ StatusBarComponent)
/* harmony export */ });
/* harmony import */ var src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/interfaces/item.interface */ 9037);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var src_app_services_event_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/event.service */ 9426);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 4534);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/icon */ 7822);







function StatusBarComponent_ng_template_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "span", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate2"]("Unlocked ", ctx_r1.wingBuffCount, " out of ", ctx_r1.wingBuffs.length, ".");
  }
}
const _c0 = function () {
  return ["/wing-buffs"];
};
class StatusBarComponent {
  constructor(_dataService, _eventService) {
    this._dataService = _dataService;
    this._eventService = _eventService;
    this.wingBuffs = [];
    this.wingBuffCount = 0;
    this._subscriptions = [];
  }
  ngOnInit() {
    this._subscriptions.push(this._eventService.itemToggled.subscribe(n => this.itemToggled(n)));
    this.wingBuffs = this._dataService.itemConfig.items.filter(item => item.type === src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__.ItemType.WingBuff);
    this.wingBuffCount = this.wingBuffs.filter(w => w.unlocked).length;
  }
  itemToggled(item) {
    if (item.type !== src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_0__.ItemType.WingBuff) {
      return;
    }
    this.wingBuffCount = this.wingBuffs.filter(w => w.unlocked).length;
  }
  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions.length = 0;
  }
}
StatusBarComponent.ɵfac = function StatusBarComponent_Factory(t) {
  return new (t || StatusBarComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_1__.DataService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](src_app_services_event_service__WEBPACK_IMPORTED_MODULE_2__.EventService));
};
StatusBarComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
  type: StatusBarComponent,
  selectors: [["app-status-bar"]],
  decls: 6,
  vars: 4,
  consts: [[1, "right"], ["placement", "top-end", "container", "body", 1, "wing-buffs", 3, "routerLink", "ngbTooltip"], ["svgIcon", "flaps", 1, "wingbuffs"], ["wbHover", ""], [1, "ws-nw"]],
  template: function StatusBarComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 0)(1, "a", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](3, "mat-icon", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](4, StatusBarComponent_ng_template_4_Template, 2, 2, "ng-template", null, 3, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplateRefExtractor"]);
    }
    if (rf & 2) {
      const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵreference"](5);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction0"](3, _c0))("ngbTooltip", _r0);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.wingBuffCount, "\u00A0");
    }
  },
  dependencies: [_angular_router__WEBPACK_IMPORTED_MODULE_4__.RouterLink, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_5__.NgbTooltip, _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__.MatIcon],
  styles: [".wing-buffs[_ngcontent-%COMP%] {\n  display: inline-block;\n  cursor: pointer;\n}\n.wing-buffs[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  color: var(--color-wing-buff);\n}\n.right[_ngcontent-%COMP%] {\n  float: right;\n  vertical-align: top;\n}\nmat-icon[_ngcontent-%COMP%] {\n  vertical-align: top;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9zdGF0dXMtYmFyL3N0YXR1cy1iYXIuY29tcG9uZW50Lmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxxQkFBQTtFQUNBLGVBQUE7QUFDRjtBQUhBO0VBS0ksNkJBQUE7QUFDSjtBQUdBO0VBQ0UsWUFBQTtFQUNBLG1CQUFBO0FBREY7QUFLQTtFQUNFLG1CQUFBO0FBSEYiLCJzb3VyY2VzQ29udGVudCI6WyIud2luZy1idWZmcyB7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgY3Vyc29yOiBwb2ludGVyO1xuXG4gIG1hdC1pY29uIHtcbiAgICBjb2xvcjogdmFyKC0tY29sb3Itd2luZy1idWZmKTtcbiAgfVxufVxuXG4ucmlnaHQge1xuICBmbG9hdDogcmlnaHQ7XG4gIHZlcnRpY2FsLWFsaWduOiB0b3A7XG5cbn1cblxubWF0LWljb24ge1xuICB2ZXJ0aWNhbC1hbGlnbjogdG9wO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ== */"]
});

/***/ }),

/***/ 4085:
/*!*************************************************************************!*\
  !*** ./src/app/components/table/table-column/table-column.directive.ts ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TableColumnDirective": () => (/* binding */ TableColumnDirective)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);

class TableColumnDirective {
  constructor(template) {
    this.template = template;
  }
}
TableColumnDirective.ɵfac = function TableColumnDirective_Factory(t) {
  return new (t || TableColumnDirective)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_0__.TemplateRef));
};
TableColumnDirective.ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineDirective"]({
  type: TableColumnDirective,
  selectors: [["", "appTableColumn", ""]]
});

/***/ }),

/***/ 1964:
/*!*************************************************************************!*\
  !*** ./src/app/components/table/table-column/table-footer.directive.ts ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TableFooterDirective": () => (/* binding */ TableFooterDirective)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);

class TableFooterDirective {
  constructor(template) {
    this.template = template;
  }
}
TableFooterDirective.ɵfac = function TableFooterDirective_Factory(t) {
  return new (t || TableFooterDirective)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_0__.TemplateRef));
};
TableFooterDirective.ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineDirective"]({
  type: TableFooterDirective,
  selectors: [["", "appTableFooter", ""]],
  inputs: {
    colspan: "colspan",
    textAlign: "textAlign"
  }
});

/***/ }),

/***/ 7397:
/*!*************************************************************************!*\
  !*** ./src/app/components/table/table-column/table-header.directive.ts ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TableHeaderDirective": () => (/* binding */ TableHeaderDirective)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);

class TableHeaderDirective {
  constructor(template) {
    this.template = template;
  }
}
TableHeaderDirective.ɵfac = function TableHeaderDirective_Factory(t) {
  return new (t || TableHeaderDirective)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_0__.TemplateRef));
};
TableHeaderDirective.ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineDirective"]({
  type: TableHeaderDirective,
  selectors: [["", "appTableHeader", ""]]
});

/***/ }),

/***/ 9767:
/*!*****************************************************!*\
  !*** ./src/app/components/table/table.component.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TableComponent": () => (/* binding */ TableComponent)
/* harmony export */ });
/* harmony import */ var _table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./table-column/table-column.directive */ 4085);
/* harmony import */ var _table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./table-column/table-header.directive */ 7397);
/* harmony import */ var _table_column_table_footer_directive__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./table-column/table-footer.directive */ 1964);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 4666);





function TableComponent_thead_2_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainer"](2, 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const header_r4 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngTemplateOutlet", header_r4.template);
  }
}
function TableComponent_thead_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "thead")(1, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, TableComponent_thead_2_ng_container_2_Template, 3, 1, "ng-container", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r0.headers);
  }
}
const _c0 = function (a0) {
  return {
    row: a0
  };
};
function TableComponent_ng_container_4_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainer"](2, 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const column_r7 = ctx.$implicit;
    const row_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngTemplateOutlet", column_r7.template)("ngTemplateOutletContext", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction1"](2, _c0, row_r5));
  }
}
function TableComponent_ng_container_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, TableComponent_ng_container_4_ng_container_2_Template, 3, 4, "ng-container", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r1.columns);
  }
}
function TableComponent_tfoot_5_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainer"](2, 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const footer_r11 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵstyleProp"]("text-align", footer_r11.textAlign);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵattribute"]("colspan", footer_r11.colspan);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngTemplateOutlet", footer_r11.template);
  }
}
function TableComponent_tfoot_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "tfoot")(1, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, TableComponent_tfoot_5_ng_container_2_Template, 3, 4, "ng-container", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r2.footers);
  }
}
class TableComponent {}
TableComponent.ɵfac = function TableComponent_Factory(t) {
  return new (t || TableComponent)();
};
TableComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
  type: TableComponent,
  selectors: [["app-table"]],
  contentQueries: function TableComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵcontentQuery"](dirIndex, _table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_1__.TableHeaderDirective, 4);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵcontentQuery"](dirIndex, _table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_0__.TableColumnDirective, 4);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵcontentQuery"](dirIndex, _table_column_table_footer_directive__WEBPACK_IMPORTED_MODULE_2__.TableFooterDirective, 4);
    }
    if (rf & 2) {
      let _t;
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵloadQuery"]()) && (ctx.headers = _t);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵloadQuery"]()) && (ctx.columns = _t);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵloadQuery"]()) && (ctx.footers = _t);
    }
  },
  inputs: {
    rows: "rows"
  },
  decls: 6,
  vars: 3,
  consts: [[1, "table-container"], [1, ""], [4, "ngIf"], [4, "ngFor", "ngForOf"], [3, "ngTemplateOutlet"], [3, "ngTemplateOutlet", "ngTemplateOutletContext"]],
  template: function TableComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 0)(1, "table", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, TableComponent_thead_2_Template, 3, 1, "thead", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "tbody");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](4, TableComponent_ng_container_4_Template, 3, 1, "ng-container", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](5, TableComponent_tfoot_5_Template, 3, 1, "tfoot", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.headers == null ? null : ctx.headers.length);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx.rows);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.footers == null ? null : ctx.footers.length);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_4__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_4__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_4__.NgTemplateOutlet],
  styles: [".table-container[_ngcontent-%COMP%] {\n  min-width: -moz-fit-content;\n  min-width: fit-content;\n  padding: var(--padding-content);\n  border-radius: var(--border-radius-round);\n  background: var(--color-item-background);\n}\ntable[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: separate;\n  border-spacing: 0 5px;\n  margin-top: -5px;\n  margin-bottom: -5px;\n}\ntd[_ngcontent-%COMP%] {\n  background-color: var(--color-background);\n}\nth[_ngcontent-%COMP%], tfoot[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  background-color: var(--color-background-dark);\n}\nth[_ngcontent-%COMP%], td[_ngcontent-%COMP%] {\n  padding: var(--padding-content);\n}\nth[_ngcontent-%COMP%]:first-child, td[_ngcontent-%COMP%]:first-child {\n  border-top-left-radius: var(--border-radius-round);\n  border-bottom-left-radius: var(--border-radius-round);\n}\nth[_ngcontent-%COMP%]:last-child, td[_ngcontent-%COMP%]:last-child {\n  border-top-right-radius: var(--border-radius-round);\n  border-bottom-right-radius: var(--border-radius-round);\n}\n.link[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n.link[_ngcontent-%COMP%]:hover {\n  color: var(--color-link-hover);\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90YWJsZS90YWJsZS5jb21wb25lbnQubGVzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLDJCQUFBO0VBQUEsc0JBQUE7RUFDQSwrQkFBQTtFQUNBLHlDQUFBO0VBQ0Esd0NBQUE7QUFDRjtBQUVBO0VBQ0UsV0FBQTtFQUNBLHlCQUFBO0VBQ0EscUJBQUE7RUFDQSxnQkFBQTtFQUNBLG1CQUFBO0FBQUY7QUFHQTtFQUNFLHlDQUFBO0FBREY7QUFJQTs7RUFDRSw4Q0FBQTtBQURGO0FBSUE7O0VBQ0UsK0JBQUE7QUFERjtBQUdFOztFQUNFLGtEQUFBO0VBQ0EscURBQUE7QUFBSjtBQUdFOztFQUNFLG1EQUFBO0VBQ0Esc0RBQUE7QUFBSjtBQUlBO0VBQ0UsZUFBQTtBQUZGO0FBSUU7RUFDRSw4QkFBQTtBQUZKIiwic291cmNlc0NvbnRlbnQiOlsiLnRhYmxlLWNvbnRhaW5lciB7XG4gIG1pbi13aWR0aDogZml0LWNvbnRlbnQ7XG4gIHBhZGRpbmc6IHZhcigtLXBhZGRpbmctY29udGVudCk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtcm91bmQpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvci1pdGVtLWJhY2tncm91bmQpO1xufVxuXG50YWJsZSB7XG4gIHdpZHRoOiAxMDAlO1xuICBib3JkZXItY29sbGFwc2U6IHNlcGFyYXRlO1xuICBib3JkZXItc3BhY2luZzogMCA1cHg7XG4gIG1hcmdpbi10b3A6IC01cHg7XG4gIG1hcmdpbi1ib3R0b206IC01cHg7XG59XG5cbnRkIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3ItYmFja2dyb3VuZCk7XG59XG5cbnRoLCB0Zm9vdCB0ZCB7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLWJhY2tncm91bmQtZGFyayk7XG59XG5cbnRoLCB0ZCB7XG4gIHBhZGRpbmc6IHZhcigtLXBhZGRpbmctY29udGVudCk7XG5cbiAgJjpmaXJzdC1jaGlsZCB7XG4gICAgYm9yZGVyLXRvcC1sZWZ0LXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy1yb3VuZCk7XG4gICAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy1yb3VuZCk7XG4gIH1cblxuICAmOmxhc3QtY2hpbGQge1xuICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLXJvdW5kKTtcbiAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy1yb3VuZCk7XG4gIH1cbn1cblxuLmxpbmsge1xuICBjdXJzb3I6IHBvaW50ZXI7XG5cbiAgJjpob3ZlciB7XG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWxpbmstaG92ZXIpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
});

/***/ }),

/***/ 1542:
/*!*****************************************************************************!*\
  !*** ./src/app/components/traveling-spirits/traveling-spirits.component.ts ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TravelingSpiritsComponent": () => (/* binding */ TravelingSpiritsComponent)
/* harmony export */ });
/* harmony import */ var src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/helpers/node-helper */ 1752);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _table_table_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../table/table.component */ 9767);
/* harmony import */ var _table_table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../table/table-column/table-column.directive */ 4085);
/* harmony import */ var _table_table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../table/table-column/table-header.directive */ 7397);








function TravelingSpiritsComponent_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "#");
  }
}
function TravelingSpiritsComponent_ng_template_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "Spirit");
  }
}
function TravelingSpiritsComponent_ng_template_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "Date");
  }
}
function TravelingSpiritsComponent_ng_template_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "Visit");
  }
}
function TravelingSpiritsComponent_ng_template_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0, "Unlocked");
  }
}
function TravelingSpiritsComponent_ng_template_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const row_r10 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", row_r10.number, " ");
  }
}
const _c0 = function (a1) {
  return ["/spirit", a1];
};
const _c1 = function (a0) {
  return {
    highlightTree: a0
  };
};
function TravelingSpiritsComponent_ng_template_9_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "a", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r11 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction1"](3, _c0, row_r11.spiritGuid))("queryParams", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction1"](5, _c1, row_r11.treeGuid));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", row_r11.spirit.name, " ");
  }
}
function TravelingSpiritsComponent_ng_template_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r12 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind2"](2, 1, row_r12.date, "dd-MM-yyyy"));
  }
}
function TravelingSpiritsComponent_ng_template_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const row_r13 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", row_r13.visit, " ");
  }
}
function TravelingSpiritsComponent_ng_template_12_span_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("completed", row_r14.unlockedItems === row_r14.totalItems);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate2"](" ", row_r14.unlockedItems, " / ", row_r14.totalItems, " ");
  }
}
function TravelingSpiritsComponent_ng_template_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](0, TravelingSpiritsComponent_ng_template_12_span_0_Template, 2, 4, "span", 6);
  }
  if (rf & 2) {
    const row_r14 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", row_r14.totalItems);
  }
}
class TravelingSpiritsComponent {
  constructor(_dataService) {
    this._dataService = _dataService;
    this.rows = [];
    this.rows = this._dataService.travelingSpiritConfig.items.map(ts => {
      // Count items.
      let unlockedItems = 0,
        totalItems = 0;
      src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__.NodeHelper.getItems(ts.tree.node).forEach(item => {
        if (item.unlocked) {
          unlockedItems++;
        }
        totalItems++;
      });
      return {
        ...ts,
        spiritGuid: ts.spirit.guid,
        treeGuid: ts.tree.guid,
        unlockedItems,
        totalItems
      };
    }).reverse();
    // const tsSet = new Set<string>();
    // const reverseTs = this._dataService.travelingSpiritConfig.items.slice().reverse();
    // const cost: ICost = {};
    // for (const ts of reverseTs) {
    //   if (tsSet.has(ts.spirit.guid)) continue;
    //   tsSet.add(ts.spirit.guid);
    //   const nodes = NodeHelper.all(ts.tree.node);
    //   nodes.forEach(n => CostHelper.add(cost, n));
    // }
    // console.log('cost', cost, 'spirits', tsSet.size);
  }
}

TravelingSpiritsComponent.ɵfac = function TravelingSpiritsComponent_Factory(t) {
  return new (t || TravelingSpiritsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_1__.DataService));
};
TravelingSpiritsComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({
  type: TravelingSpiritsComponent,
  selectors: [["app-traveling-spirits"]],
  decls: 13,
  vars: 1,
  consts: [[1, "h2"], [3, "rows"], [3, "appTableHeader"], [3, "appTableColumn"], [3, "routerLink", "queryParams"], [1, "ws-nw"], [3, "completed", 4, "ngIf"]],
  template: function TravelingSpiritsComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, "Traveling Spirits");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "app-table", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](3, TravelingSpiritsComponent_ng_template_3_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](4, TravelingSpiritsComponent_ng_template_4_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](5, TravelingSpiritsComponent_ng_template_5_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](6, TravelingSpiritsComponent_ng_template_6_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](7, TravelingSpiritsComponent_ng_template_7_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](8, TravelingSpiritsComponent_ng_template_8_Template, 1, 1, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](9, TravelingSpiritsComponent_ng_template_9_Template, 2, 7, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](10, TravelingSpiritsComponent_ng_template_10_Template, 3, 4, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](11, TravelingSpiritsComponent_ng_template_11_Template, 1, 1, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](12, TravelingSpiritsComponent_ng_template_12_Template, 1, 1, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("rows", ctx.rows);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_7__.RouterLink, _table_table_component__WEBPACK_IMPORTED_MODULE_2__.TableComponent, _table_table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_3__.TableColumnDirective, _table_table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_4__.TableHeaderDirective, _angular_common__WEBPACK_IMPORTED_MODULE_6__.DatePipe],
  styles: [".completed[_ngcontent-%COMP%] {\n  color: var(--color-unlock-check);\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90cmF2ZWxpbmctc3Bpcml0cy90cmF2ZWxpbmctc3Bpcml0cy5jb21wb25lbnQubGVzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGdDQUFBO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIuY29tcGxldGVkIHtcbiAgY29sb3I6IHZhcigtLWNvbG9yLXVubG9jay1jaGVjayk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
});

/***/ }),

/***/ 6837:
/*!***************************************************************!*\
  !*** ./src/app/components/wing-buffs/wing-buffs.component.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WingBuffsComponent": () => (/* binding */ WingBuffsComponent)
/* harmony export */ });
/* harmony import */ var src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/helpers/node-helper */ 1752);
/* harmony import */ var src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/interfaces/item.interface */ 9037);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _table_table_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../table/table.component */ 9767);
/* harmony import */ var _table_table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../table/table-column/table-column.directive */ 4085);
/* harmony import */ var _table_table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../table/table-column/table-header.directive */ 7397);
/* harmony import */ var _table_table_column_table_footer_directive__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../table/table-column/table-footer.directive */ 1964);










function WingBuffsComponent_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0, "Spirit");
  }
}
function WingBuffsComponent_ng_template_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0, "Type");
  }
}
function WingBuffsComponent_ng_template_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0, "Origin");
  }
}
function WingBuffsComponent_ng_template_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0, "Unlocked");
  }
}
const _c0 = function (a1) {
  return ["/spirit", a1];
};
function WingBuffsComponent_ng_template_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "a", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r10 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](2, _c0, row_r10.guid));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", row_r10.name, " ");
  }
}
function WingBuffsComponent_ng_template_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const row_r11 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", row_r11.type, " ");
  }
}
const _c1 = function (a1) {
  return ["/season", a1];
};
function WingBuffsComponent_ng_template_9_a_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "a", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](2, _c1, row_r12.season.guid));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](row_r12.season.name);
  }
}
function WingBuffsComponent_ng_template_9_a_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "a");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](row_r12.area.realm.name);
  }
}
function WingBuffsComponent_ng_template_9_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](0, WingBuffsComponent_ng_template_9_a_0_Template, 2, 4, "a", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](1, WingBuffsComponent_ng_template_9_a_1_Template, 2, 1, "a", 8);
  }
  if (rf & 2) {
    const row_r12 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", row_r12.season);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", row_r12.type === "Regular");
  }
}
function WingBuffsComponent_ng_template_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const row_r17 = ctx.row;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("completed", row_r17.unlocked === row_r17.total);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate2"](" ", row_r17.unlocked, " / ", row_r17.total, " ");
  }
}
function WingBuffsComponent_ng_template_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0, "Total:");
  }
}
function WingBuffsComponent_ng_template_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("completed", ctx_r9.unlocked === ctx_r9.total);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate2"]("", ctx_r9.unlocked, " / ", ctx_r9.total, "");
  }
}
class WingBuffsComponent {
  constructor(_dataService) {
    this._dataService = _dataService;
    this.unlocked = 0;
    this.total = 0;
  }
  ngOnInit() {
    // Get all wing buffs.
    const itemSet = new Set();
    for (const item of this._dataService.itemConfig.items.filter(item => item.type === src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_1__.ItemType.WingBuff)) {
      itemSet.add(item);
      if (item.unlocked) {
        this.unlocked++;
      }
      this.total++;
    }
    // Go through items to find spirit.
    const regularSpiritSet = new Set();
    const seasonSpiritSet = new Set();
    const spiritCount = new Map();
    for (const item of itemSet) {
      if (!item.nodes?.length) {
        continue;
      }
      const rootNode = src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__.NodeHelper.getRoot(item.nodes[0]);
      const spiritTree = rootNode.spiritTree;
      let spirit;
      let isSeasonal = false;
      if (spiritTree?.spirit) {
        spirit = spiritTree.spirit;
      } else if (spiritTree?.ts) {
        spirit = spiritTree.ts.spirit;
        isSeasonal = true;
      } else if (spiritTree?.visit) {
        spirit = spiritTree.visit.spirit;
        isSeasonal = true;
      }
      if (spirit) {
        if (!spiritCount.has(spirit.guid)) {
          spiritCount.set(spirit.guid, {
            unlocked: 0,
            total: 0
          });
        }
        const count = spiritCount.get(spirit.guid);
        count.total++;
        if (item.unlocked) {
          count.unlocked++;
        }
        if (isSeasonal) {
          seasonSpiritSet.add(spirit);
        } else {
          regularSpiritSet.add(spirit);
        }
      }
    }
    // Combine regular and seasonal spirits.
    const spirits = Array.from(regularSpiritSet).concat(Array.from(seasonSpiritSet));
    this.rows = spirits.map(spirit => {
      const count = spiritCount.get(spirit.guid);
      return {
        ...spirit,
        ...count
      };
    });
  }
}
WingBuffsComponent.ɵfac = function WingBuffsComponent_Factory(t) {
  return new (t || WingBuffsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_2__.DataService));
};
WingBuffsComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineComponent"]({
  type: WingBuffsComponent,
  selectors: [["app-wing-buffs"]],
  decls: 13,
  vars: 3,
  consts: [[1, "h2"], [3, "rows"], [3, "appTableHeader"], [3, "appTableColumn"], [3, "appTableFooter", "colspan", "textAlign"], [3, "appTableFooter"], [3, "routerLink"], [3, "routerLink", 4, "ngIf"], [4, "ngIf"]],
  template: function WingBuffsComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "h1", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1, "Wing Buffs");
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "app-table", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, WingBuffsComponent_ng_template_3_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](4, WingBuffsComponent_ng_template_4_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](5, WingBuffsComponent_ng_template_5_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](6, WingBuffsComponent_ng_template_6_Template, 1, 0, "ng-template", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](7, WingBuffsComponent_ng_template_7_Template, 2, 4, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](8, WingBuffsComponent_ng_template_8_Template, 1, 1, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](9, WingBuffsComponent_ng_template_9_Template, 2, 2, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](10, WingBuffsComponent_ng_template_10_Template, 2, 4, "ng-template", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](11, WingBuffsComponent_ng_template_11_Template, 1, 0, "ng-template", 4);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](12, WingBuffsComponent_ng_template_12_Template, 2, 4, "ng-template", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("rows", ctx.rows);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](9);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("colspan", 3)("textAlign", "right");
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_8__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_9__.RouterLink, _table_table_component__WEBPACK_IMPORTED_MODULE_3__.TableComponent, _table_table_column_table_column_directive__WEBPACK_IMPORTED_MODULE_4__.TableColumnDirective, _table_table_column_table_header_directive__WEBPACK_IMPORTED_MODULE_5__.TableHeaderDirective, _table_table_column_table_footer_directive__WEBPACK_IMPORTED_MODULE_6__.TableFooterDirective],
  styles: [".completed[_ngcontent-%COMP%] {\n  color: var(--color-new);\n  font-weight: bold;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy93aW5nLWJ1ZmZzL3dpbmctYnVmZnMuY29tcG9uZW50Lmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSx1QkFBQTtFQUNBLGlCQUFBO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIuY29tcGxldGVkIHtcbiAgY29sb3I6IHZhcigtLWNvbG9yLW5ldyk7XG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ== */"]
});

/***/ }),

/***/ 999:
/*!****************************************!*\
  !*** ./src/app/helpers/cost-helper.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CostHelper": () => (/* binding */ CostHelper)
/* harmony export */ });
class CostHelper {
  static isEmpty(value) {
    return !value.c && !value.h && !value.sc && !value.sh && !value.ac;
  }
  static add(target, value) {
    if (value.c) {
      target.c = (target.c || 0) + value.c;
    }
    if (value.h) {
      target.h = (target.h || 0) + value.h;
    }
    if (value.sc) {
      target.sc = (target.sc || 0) + value.sc;
    }
    if (value.sh) {
      target.sh = (target.sh || 0) + value.sh;
    }
    if (value.ac) {
      target.ac = (target.ac || 0) + value.ac;
    }
  }
  static subtract(target, value) {
    if (value.c) {
      target.c = (target.c || 0) - value.c;
    }
    if (value.h) {
      target.h = (target.h || 0) - value.h;
    }
    if (value.sc) {
      target.sc = (target.sc || 0) - value.sc;
    }
    if (value.sh) {
      target.sh = (target.sh || 0) - value.sh;
    }
    if (value.ac) {
      target.ac = (target.ac || 0) - value.ac;
    }
  }
}

/***/ }),

/***/ 5852:
/*!****************************************!*\
  !*** ./src/app/helpers/date-helper.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DateHelper": () => (/* binding */ DateHelper)
/* harmony export */ });
class DateHelper {
  static fromInterface(date) {
    if (!date) {
      return;
    }
    if (date instanceof Date) {
      return date;
    }
    return new Date(date.year, date.month - 1, date.day);
  }
  static fromString(date) {
    if (!date) {
      return;
    }
    return new Date(Date.parse(date));
  }
}

/***/ }),

/***/ 1752:
/*!****************************************!*\
  !*** ./src/app/helpers/node-helper.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NodeHelper": () => (/* binding */ NodeHelper)
/* harmony export */ });
class NodeHelper {
  /** Finds the first node that satisfies the predicate.
  * @param node Node to start searching from.
  * @param predicate Function to search for.
  * @returns First node that matches or undefined.
  */
  static find(node, predicate) {
    if (predicate(node)) {
      return node;
    }
    return node?.nw && this.find(node.nw, predicate) || node?.ne && this.find(node.ne, predicate) || node?.n && this.find(node.n, predicate) || undefined;
  }
  /** Gets the root node from a given node. */
  static getRoot(node) {
    if (!node) {
      return node;
    }
    while (node.prev) {
      node = node.prev;
    }
    return node;
  }
  /** Returns all nodes from the given node.
  * @param node Node to start from.
  * @param nodes Array to add items to.
  * @returns `nodes` or new array with all nodes.
  */
  static all(node, nodes) {
    nodes ??= [];
    nodes.push(node);
    if (node.nw) {
      this.all(node.nw, nodes);
    }
    if (node.ne) {
      this.all(node.ne, nodes);
    }
    if (node.n) {
      this.all(node.n, nodes);
    }
    return nodes;
  }
  static getItems(node) {
    const itemSet = new Set();
    this.all(node).filter(n => n.item).forEach(n => itemSet.add(n.item));
    return [...itemSet];
  }
}

/***/ }),

/***/ 7398:
/*!******************************************!*\
  !*** ./src/app/helpers/spirit-helper.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SpiritHelper": () => (/* binding */ SpiritHelper)
/* harmony export */ });
class SpiritHelper {
  static getTrees(spirit) {
    const treeDates = [];
    // Add all trees that need sorting.
    spirit.ts?.forEach(t => {
      treeDates.push({
        date: t.date,
        tree: t.tree
      });
    });
    spirit.returns?.forEach(r => {
      treeDates.push({
        date: r.return.date,
        tree: r.tree
      });
    });
    // Sort TS and revisits by date.
    treeDates.sort((a, b) => a.date.getTime() - b.date.getTime());
    // Combine spirit base tree with sorted trees.
    const trees = [];
    if (spirit.tree) {
      trees.push(spirit.tree);
    }
    trees.push(...treeDates.map(t => t.tree));
    return trees;
  }
}

/***/ }),

/***/ 9037:
/*!**********************************************!*\
  !*** ./src/app/interfaces/item.interface.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ItemType": () => (/* binding */ ItemType)
/* harmony export */ });
var ItemType;
(function (ItemType) {
  /** All cosmetics in the hat category. */
  ItemType["Hat"] = "Hat";
  /** All cosmetics in the hair category. */
  ItemType["Hair"] = "Hair";
  /** All cosmetics in the mask category. */
  ItemType["Mask"] = "Mask";
  /** All cosmetics in the nacklace category.*/
  ItemType["Necklace"] = "Necklace";
  /** All cosmetics in the pants category. */
  ItemType["Outfit"] = "Outfit";
  /** All cosmetics in the cape category. */
  ItemType["Cape"] = "Cape";
  /** All musical instruments in the held category. */
  ItemType["Instrument"] = "Instrument";
  /** All non-instrument items in the held category. */
  ItemType["Held"] = "Held";
  /** All items in the chair category. */
  ItemType["Prop"] = "Prop";
  /** All emotes. */
  ItemType["Emote"] = "Emote";
  /** All stances. */
  ItemType["Stance"] = "Stance";
  /** All honks. */
  ItemType["Call"] = "Call";
  /** All spells in the spell tab. */
  ItemType["Spell"] = "Spell";
  /** All music sheets. */
  ItemType["Music"] = "Music";
  /** All quests. */
  ItemType["Quest"] = "Quest";
  /** All wing buffs */
  ItemType["WingBuff"] = "WingBuff";
  /** Other special (non-)items such as candle blessings. */
  ItemType["Special"] = "Special";
})(ItemType || (ItemType = {}));

/***/ }),

/***/ 2468:
/*!******************************************!*\
  !*** ./src/app/services/data.service.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DataService": () => (/* binding */ DataService)
/* harmony export */ });
/* harmony import */ var json5__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! json5 */ 3831);
/* harmony import */ var json5__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(json5__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 6067);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 1640);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! moment */ 6908);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _helpers_date_helper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../helpers/date-helper */ 5852);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ 8987);
/* harmony import */ var _storage_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./storage.service */ 1188);








class DataService {
  constructor(_httpClient, _storageService) {
    this._httpClient = _httpClient;
    this._storageService = _storageService;
    this.guidMap = new Map();
    this.onData = new rxjs__WEBPACK_IMPORTED_MODULE_4__.ReplaySubject();
    this.loadData().add(() => {
      this.exposeData();
    });
  }
  loadData() {
    const get = asset => this._httpClient.get(`assets/data/${asset}`, {
      responseType: 'text'
    });
    return (0,rxjs__WEBPACK_IMPORTED_MODULE_5__.forkJoin)({
      areaConfig: get('areas.json'),
      connectionConfig: get('connections.json'),
      eventConfig: get('events.json'),
      itemConfig: get('items.json'),
      nodeConfig: get('nodes.json'),
      questConfig: get('quests.json'),
      realmConfig: get('realms.json'),
      seasonConfig: get('seasons.json'),
      shopConfig: get('shops.json'),
      iapConfig: get('iaps.json'),
      spiritConfig: get('spirits.json'),
      spiritTreeConfig: get('spirit-trees.json'),
      travelingSpiritConfig: get('traveling-spirits.json'),
      returningSpiritsConfig: get('returning-spirits.json'),
      wingedLightConfig: get('winged-lights.json')
    }).subscribe({
      next: data => {
        this.onConfigs(data);
      },
      error: e => console.error(e)
    });
  }
  onConfigs(configs) {
    // Deserialize configs.
    const configArray = Object.keys(configs).map(k => {
      const parsed = json5__WEBPACK_IMPORTED_MODULE_0___default().parse(configs[k]);
      this[k] = parsed; // Map all configs to their property.
      return parsed;
    });
    // Register all GUIDs.
    this.initializeGuids(configArray);
    console.log(`Loaded ${configArray.length} configs.`);
    // Create object references.
    this.initializeRealms();
    this.initializeAreas();
    this.initializeSeasons();
    this.initializeSpirits();
    this.initializeTravelingSpirits();
    this.initializeReturningSpirits();
    this.initializeSpiritTrees();
    this.initializeEvents();
    this.initializeShops();
    this.initializeItems();
    if ((0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.isDevMode)()) {
      this.validate();
    }
    this.onData.next();
    this.onData.complete();
  }
  initializeRealms() {
    this.realmConfig.items.forEach(realm => {
      // Map areas to realms.
      realm.areas?.forEach((area, i) => {
        area = this.guidMap.get(area);
        realm.areas[i] = area;
        area.realm = realm;
      });
    });
  }
  initializeAreas() {
    this.areaConfig.items.forEach(area => {
      // Map Spirit to Areas.
      area.spirits?.forEach((spirit, i) => {
        spirit = this.guidMap.get(spirit);
        area.spirits[i] = spirit;
        spirit.area = area;
      });
      // Map Winged Light to Area.
      area.wingedLights?.forEach((wl, i) => {
        wl = this.guidMap.get(wl);
        area.wingedLights[i] = wl;
        wl.area = area;
      });
    });
  }
  initializeSeasons() {
    this.seasonConfig.items.forEach((season, i) => {
      season.number = i + 1;
      season.date = _helpers_date_helper__WEBPACK_IMPORTED_MODULE_2__.DateHelper.fromString(season.date);
      season.endDate = _helpers_date_helper__WEBPACK_IMPORTED_MODULE_2__.DateHelper.fromString(season.endDate);
      // Map Spirits to Season.
      season.spirits?.forEach((spirit, si) => {
        spirit = this.guidMap.get(spirit);
        season.spirits[si] = spirit;
        spirit.season = season;
      });
      // Map Shops to Season
      season.shops?.forEach((shop, si) => {
        shop = this.guidMap.get(shop);
        season.shops[si] = shop;
        shop.season = season;
      });
    });
  }
  initializeSpirits() {
    this.spiritConfig.items.forEach(spirit => {
      // Map spirits to spirit tree.
      if (spirit.tree) {
        const tree = this.guidMap.get(spirit.tree);
        tree.spirit = spirit;
        spirit.tree = tree;
      }
    });
  }
  initializeTravelingSpirits() {
    const tsCounts = {};
    this.travelingSpiritConfig.items.forEach((ts, i) => {
      // Initialize dates
      ts.date = _helpers_date_helper__WEBPACK_IMPORTED_MODULE_2__.DateHelper.fromInterface(ts.date);
      ts.endDate = _helpers_date_helper__WEBPACK_IMPORTED_MODULE_2__.DateHelper.fromInterface(ts.endDate) ?? moment__WEBPACK_IMPORTED_MODULE_1___default()(ts.date).add(3, 'day').toDate();
      ts.endDate = moment__WEBPACK_IMPORTED_MODULE_1___default()(ts.endDate).endOf('day').toDate();
      // Map TS to Spirit.
      const spirit = this.guidMap.get(ts.spirit);
      ts.spirit = spirit;
      spirit.ts ??= [];
      spirit.ts.push(ts);
      tsCounts[spirit.name] ??= 0;
      tsCounts[spirit.name]++;
      ts.number = i + 1;
      ts.visit = tsCounts[spirit.name];
      // Map TS to Spirit Tree.
      const tree = this.guidMap.get(ts.tree);
      ts.tree = tree;
      tree.ts = ts;
    });
  }
  initializeReturningSpirits() {
    this.returningSpiritsConfig.items.forEach((rs, i) => {
      // Initialize dates
      rs.date = _helpers_date_helper__WEBPACK_IMPORTED_MODULE_2__.DateHelper.fromInterface(rs.date);
      rs.endDate = _helpers_date_helper__WEBPACK_IMPORTED_MODULE_2__.DateHelper.fromInterface(rs.endDate);
      rs.endDate = moment__WEBPACK_IMPORTED_MODULE_1___default()(rs.endDate).endOf('day').toDate();
      // Map Visits.
      rs.spirits?.forEach((visit, si) => {
        this.registerGuid(visit);
        visit.return = rs;
        // Map Visit to Spirit.
        const spirit = this.guidMap.get(visit.spirit);
        rs.spirits[si].spirit = spirit;
        spirit.returns ??= [];
        spirit.returns.push(visit);
        // Map Visit to Spirit Tree.
        const tree = this.guidMap.get(visit.tree);
        rs.spirits[si].tree = tree;
        tree.visit = visit;
      });
    });
  }
  initializeSpiritTrees() {
    this.spiritTreeConfig.items.forEach(spiritTree => {
      // Map Spirit Tree to Node.
      const node = this.guidMap.get(spiritTree.node);
      if (!node) {
        console.error('Node not found', spiritTree.node);
      }
      spiritTree.node = node;
      node.spiritTree = spiritTree;
      this.initializeNode(node);
    });
  }
  initializeNode(node, prev) {
    const getNode = guid => {
      const v = this.guidMap.get(guid);
      return this.initializeNode(v, node);
    };
    if (prev) {
      node.prev = prev;
    }
    if (typeof node.n === 'string') {
      node.n = getNode(node.n);
    }
    if (typeof node.nw === 'string') {
      node.nw = getNode(node.nw);
    }
    if (typeof node.ne === 'string') {
      node.ne = getNode(node.ne);
    }
    if (typeof node.item === 'string') {
      const item = this.guidMap.get(node.item);
      if (!item) {
        console.error('Item not found', node.item);
      }
      node.item = item;
      item.nodes ??= [];
      item.nodes.push(node);
    }
    node.unlocked = this._storageService.unlocked.has(node.guid);
    return node;
  }
  initializeItems() {
    this.itemConfig.items.forEach(item => {
      item.unlocked ||= this._storageService.unlocked.has(item.guid);
      item.order ??= 999999;
    });
  }
  initializeEvents() {
    this.eventConfig.items.forEach(event => {
      event.instances?.forEach((eventInstance, iInstance) => {
        this.registerGuid(eventInstance);
        eventInstance.number = iInstance + 1;
        // Initialize dates
        eventInstance.date = _helpers_date_helper__WEBPACK_IMPORTED_MODULE_2__.DateHelper.fromInterface(eventInstance.date);
        eventInstance.endDate = _helpers_date_helper__WEBPACK_IMPORTED_MODULE_2__.DateHelper.fromInterface(eventInstance.endDate);
        eventInstance.endDate = moment__WEBPACK_IMPORTED_MODULE_1___default()(eventInstance.endDate).endOf('day').toDate();
        // Map Instance to Event.
        eventInstance.event = event;
        // Map shops to instance.
        eventInstance.shops?.forEach((shop, iShop) => {
          shop = this.guidMap.get(shop);
          eventInstance.shops[iShop] = shop;
          shop.event = eventInstance;
        });
        // Initialize event spirits.
        eventInstance.spirits?.forEach(eventSpirit => {
          eventSpirit.eventInstance = eventInstance;
          const spirit = this.guidMap.get(eventSpirit.spirit);
          if (!spirit) {
            console.error('Spirit not found', eventSpirit.spirit);
          }
          eventSpirit.spirit = spirit;
          eventSpirit.spirit.events = [];
          eventSpirit.spirit.events.push(eventSpirit);
          const tree = this.guidMap.get(eventSpirit.tree);
          if (!tree) {
            console.error('Tree not found', eventSpirit.tree);
          }
          eventSpirit.tree = tree;
          tree.eventInstanceSpirit = eventSpirit;
        });
      });
    });
  }
  initializeShops() {
    this.shopConfig.items.forEach(shop => {
      // Map Shop to Spirit.
      if (shop.spirit) {
        const spirit = this.guidMap.get(shop.spirit);
        shop.spirit = spirit;
        spirit.shops ??= [];
        spirit.shops.push(shop);
      }
      shop.iaps?.forEach((iap, iIap) => {
        iap = this.guidMap.get(iap);
        shop.iaps[iIap] = iap;
        iap.shop = shop;
        iap.bought = this._storageService.unlocked.has(iap.guid);
        iap.items?.forEach((itemGuid, iItem) => {
          const item = this.guidMap.get(itemGuid);
          if (!item) {
            console.error('Item not found', itemGuid);
          }
          iap.items[iItem] = item;
          item.iaps ??= [];
          item.iaps.push(iap);
        });
      });
    });
  }
  exposeData() {
    window.skyData = {
      areaConfig: this.areaConfig,
      spiritTreeConfig: this.spiritTreeConfig,
      eventConfig: this.eventConfig,
      itemConfig: this.itemConfig,
      nodeConfig: this.nodeConfig,
      questConfig: this.questConfig,
      realmConfig: this.realmConfig,
      seasonConfig: this.seasonConfig,
      shopConfig: this.shopConfig,
      spiritConfig: this.spiritConfig,
      travelingSpiritConfig: this.travelingSpiritConfig,
      returningSpiritsConfig: this.returningSpiritsConfig,
      wingedLightConfig: this.wingedLightConfig
    };
    window.skyGuids = this.guidMap;
    console.log('To view loaded data, see `skyData`.');
  }
  // #region GUIDs
  initializeGuids(configs) {
    for (const config of configs) {
      config.items.forEach(v => this.registerGuid(v));
    }
  }
  registerGuid(obj) {
    if (!obj.guid) {
      throw new Error(`GUID not defined on: ${JSON.stringify(obj)}`);
    }
    if (obj.guid.length !== 10) {
      console.error('GUID unexpected length:', obj.guid);
    }
    if (this.guidMap.has(obj.guid)) {
      throw new Error(`GUID ${obj.guid} already registered!`);
    }
    this.guidMap.set(obj.guid, obj);
  }
  // #endregion
  // #region Validation
  validate() {
    const wl = new Set(this.areaConfig.items.flatMap(a => a.wingedLights || []).map(w => w.guid));
    const xWl = this.wingedLightConfig.items.filter(w => !wl.has(w.guid));
    if (xWl.length) {
      console.error('Winged Light not found in areas:', xWl);
    }
    ;
  }
}
DataService.ɵfac = function DataService_Factory(t) {
  return new (t || DataService)(_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpClient), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵinject"](_storage_service__WEBPACK_IMPORTED_MODULE_3__.StorageService));
};
DataService.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineInjectable"]({
  token: DataService,
  factory: DataService.ɵfac,
  providedIn: 'root'
});

/***/ }),

/***/ 3631:
/*!*******************************************!*\
  !*** ./src/app/services/debug.service.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DebugService": () => (/* binding */ DebugService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);

class DebugService {
  constructor(_zone) {
    this._zone = _zone;
    this._copyItem = false;
    this._copyShop = false;
    window.debug = this;
  }
  set copyItem(value) {
    this._zone.run(() => {
      this._copyItem = !!value;
    });
  }
  get copyItem() {
    return this._copyItem;
  }
  set copyShop(value) {
    this._zone.run(() => {
      this._copyShop = !!value;
    });
  }
  get copyShop() {
    return this._copyShop;
  }
}
DebugService.ɵfac = function DebugService_Factory(t) {
  return new (t || DebugService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_core__WEBPACK_IMPORTED_MODULE_0__.NgZone));
};
DebugService.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({
  token: DebugService,
  factory: DebugService.ɵfac,
  providedIn: 'root'
});

/***/ }),

/***/ 9426:
/*!*******************************************!*\
  !*** ./src/app/services/event.service.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventService": () => (/* binding */ EventService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ 228);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);


class EventService {
  constructor() {
    this.itemToggled = new rxjs__WEBPACK_IMPORTED_MODULE_0__.Subject();
  }
  toggleItem(item) {
    this.itemToggled.next(item);
  }
}
EventService.ɵfac = function EventService_Factory(t) {
  return new (t || EventService)();
};
EventService.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
  token: EventService,
  factory: EventService.ɵfac,
  providedIn: 'root'
});

/***/ }),

/***/ 5699:
/*!*****************************************!*\
  !*** ./src/app/services/iap.service.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IAPService": () => (/* binding */ IAPService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _event_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./event.service */ 9426);
/* harmony import */ var _storage_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./storage.service */ 1188);



class IAPService {
  constructor(_eventService, _storageService) {
    this._eventService = _eventService;
    this._storageService = _storageService;
  }
  togglePurchased(iap) {
    if (!iap) {
      return;
    }
    const unlock = !iap.bought;
    unlock ? this.unlockIap(iap) : this.lockIap(iap);
    // Notify listeners.
    iap.items?.forEach(item => {
      this._eventService.toggleItem(item);
    });
  }
  unlockIap(iap) {
    // Warn about unlocking an IAP that is already unlocked elsewhere.
    if (iap.items?.find(item => item.unlocked)) {
      const confirmed = confirm('This IAP contains an item that is already unlocked. Do you want to continue?');
      if (!confirmed) {
        return;
      }
    }
    // Unlock the IAP and items.
    const guids = [iap.guid];
    iap.bought = true;
    iap.items?.forEach(item => {
      item.unlocked = true;
      guids.push(item.guid);
    });
    // Save data.
    this._storageService.add(...guids);
    this._storageService.save();
  }
  lockIap(iap) {
    // Lock the IAP.
    const guids = [iap.guid];
    iap.bought = false;
    // Only remove item if it's not unlocked by another IAP.
    iap.items?.forEach(item => {
      item.unlocked = !!item.iaps?.find(i => i.bought);
      if (!item.unlocked) {
        guids.push(item.guid);
      }
    });
    // Save data.
    this._storageService.remove(...guids);
    this._storageService.save();
  }
}
IAPService.ɵfac = function IAPService_Factory(t) {
  return new (t || IAPService)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_event_service__WEBPACK_IMPORTED_MODULE_0__.EventService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_storage_service__WEBPACK_IMPORTED_MODULE_1__.StorageService));
};
IAPService.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
  token: IAPService,
  factory: IAPService.ɵfac,
  providedIn: 'root'
});

/***/ }),

/***/ 4249:
/*!*******************************************!*\
  !*** ./src/app/services/image.service.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ImageService": () => (/* binding */ ImageService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ 6067);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ 8987);



class ImageService {
  constructor(_http) {
    this._http = _http;
  }
  get(url) {
    const obs = new rxjs__WEBPACK_IMPORTED_MODULE_0__.ReplaySubject(1);
    this._http.get(url, {
      responseType: 'blob'
    }).subscribe({
      next: blob => {
        const objectUrl = window.URL.createObjectURL(blob);
        obs.next(objectUrl);
        obs.complete();
      },
      error: e => obs.error(e)
    });
    return obs;
  }
}
ImageService.ɵfac = function ImageService_Factory(t) {
  return new (t || ImageService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_2__.HttpClient));
};
ImageService.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
  token: ImageService,
  factory: ImageService.ɵfac,
  providedIn: 'root'
});

/***/ }),

/***/ 1188:
/*!*********************************************!*\
  !*** ./src/app/services/storage.service.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StorageService": () => (/* binding */ StorageService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);

class StorageService {
  constructor() {
    this.unlocked = new Set();
    const guids = localStorage.getItem('unlocked')?.split(',') || [];
    guids.forEach(g => this.unlocked.add(g));
  }
  add(...guids) {
    guids?.forEach(g => this.unlocked.add(g));
  }
  remove(...guids) {
    guids?.forEach(g => this.unlocked.delete(g));
  }
  save() {
    const items = [...this.unlocked].join(',');
    localStorage.setItem('unlocked', items);
  }
}
StorageService.ɵfac = function StorageService_Factory(t) {
  return new (t || StorageService)();
};
StorageService.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({
  token: StorageService,
  factory: StorageService.ɵfac,
  providedIn: 'root'
});

/***/ }),

/***/ 4431:
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser */ 4497);
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app/app.module */ 6747);


_angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__.platformBrowser().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_0__.AppModule).catch(err => console.error(err));

/***/ }),

/***/ 6700:
/*!***************************************************!*\
  !*** ./node_modules/moment/locale/ sync ^\.\/.*$ ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./af": 8685,
	"./af.js": 8685,
	"./ar": 254,
	"./ar-dz": 4312,
	"./ar-dz.js": 4312,
	"./ar-kw": 2614,
	"./ar-kw.js": 2614,
	"./ar-ly": 8630,
	"./ar-ly.js": 8630,
	"./ar-ma": 8674,
	"./ar-ma.js": 8674,
	"./ar-sa": 9032,
	"./ar-sa.js": 9032,
	"./ar-tn": 4730,
	"./ar-tn.js": 4730,
	"./ar.js": 254,
	"./az": 3052,
	"./az.js": 3052,
	"./be": 150,
	"./be.js": 150,
	"./bg": 3069,
	"./bg.js": 3069,
	"./bm": 3466,
	"./bm.js": 3466,
	"./bn": 8516,
	"./bn-bd": 557,
	"./bn-bd.js": 557,
	"./bn.js": 8516,
	"./bo": 6273,
	"./bo.js": 6273,
	"./br": 9588,
	"./br.js": 9588,
	"./bs": 9815,
	"./bs.js": 9815,
	"./ca": 3331,
	"./ca.js": 3331,
	"./cs": 1320,
	"./cs.js": 1320,
	"./cv": 2219,
	"./cv.js": 2219,
	"./cy": 8266,
	"./cy.js": 8266,
	"./da": 6427,
	"./da.js": 6427,
	"./de": 7435,
	"./de-at": 2871,
	"./de-at.js": 2871,
	"./de-ch": 2994,
	"./de-ch.js": 2994,
	"./de.js": 7435,
	"./dv": 2357,
	"./dv.js": 2357,
	"./el": 5649,
	"./el.js": 5649,
	"./en-au": 9961,
	"./en-au.js": 9961,
	"./en-ca": 9878,
	"./en-ca.js": 9878,
	"./en-gb": 3924,
	"./en-gb.js": 3924,
	"./en-ie": 864,
	"./en-ie.js": 864,
	"./en-il": 1579,
	"./en-il.js": 1579,
	"./en-in": 940,
	"./en-in.js": 940,
	"./en-nz": 6181,
	"./en-nz.js": 6181,
	"./en-sg": 4301,
	"./en-sg.js": 4301,
	"./eo": 5291,
	"./eo.js": 5291,
	"./es": 4529,
	"./es-do": 3764,
	"./es-do.js": 3764,
	"./es-mx": 2584,
	"./es-mx.js": 2584,
	"./es-us": 3425,
	"./es-us.js": 3425,
	"./es.js": 4529,
	"./et": 5203,
	"./et.js": 5203,
	"./eu": 678,
	"./eu.js": 678,
	"./fa": 3483,
	"./fa.js": 3483,
	"./fi": 6262,
	"./fi.js": 6262,
	"./fil": 2521,
	"./fil.js": 2521,
	"./fo": 4555,
	"./fo.js": 4555,
	"./fr": 3131,
	"./fr-ca": 8239,
	"./fr-ca.js": 8239,
	"./fr-ch": 1702,
	"./fr-ch.js": 1702,
	"./fr.js": 3131,
	"./fy": 267,
	"./fy.js": 267,
	"./ga": 3821,
	"./ga.js": 3821,
	"./gd": 1753,
	"./gd.js": 1753,
	"./gl": 4074,
	"./gl.js": 4074,
	"./gom-deva": 2762,
	"./gom-deva.js": 2762,
	"./gom-latn": 5969,
	"./gom-latn.js": 5969,
	"./gu": 2809,
	"./gu.js": 2809,
	"./he": 5402,
	"./he.js": 5402,
	"./hi": 315,
	"./hi.js": 315,
	"./hr": 410,
	"./hr.js": 410,
	"./hu": 8288,
	"./hu.js": 8288,
	"./hy-am": 7928,
	"./hy-am.js": 7928,
	"./id": 1334,
	"./id.js": 1334,
	"./is": 6959,
	"./is.js": 6959,
	"./it": 4864,
	"./it-ch": 1124,
	"./it-ch.js": 1124,
	"./it.js": 4864,
	"./ja": 6141,
	"./ja.js": 6141,
	"./jv": 9187,
	"./jv.js": 9187,
	"./ka": 2136,
	"./ka.js": 2136,
	"./kk": 4332,
	"./kk.js": 4332,
	"./km": 8607,
	"./km.js": 8607,
	"./kn": 4305,
	"./kn.js": 4305,
	"./ko": 234,
	"./ko.js": 234,
	"./ku": 6003,
	"./ku.js": 6003,
	"./ky": 5061,
	"./ky.js": 5061,
	"./lb": 2786,
	"./lb.js": 2786,
	"./lo": 6183,
	"./lo.js": 6183,
	"./lt": 29,
	"./lt.js": 29,
	"./lv": 4169,
	"./lv.js": 4169,
	"./me": 8577,
	"./me.js": 8577,
	"./mi": 8177,
	"./mi.js": 8177,
	"./mk": 337,
	"./mk.js": 337,
	"./ml": 5260,
	"./ml.js": 5260,
	"./mn": 2325,
	"./mn.js": 2325,
	"./mr": 4695,
	"./mr.js": 4695,
	"./ms": 5334,
	"./ms-my": 7151,
	"./ms-my.js": 7151,
	"./ms.js": 5334,
	"./mt": 3570,
	"./mt.js": 3570,
	"./my": 7963,
	"./my.js": 7963,
	"./nb": 8028,
	"./nb.js": 8028,
	"./ne": 6638,
	"./ne.js": 6638,
	"./nl": 302,
	"./nl-be": 6782,
	"./nl-be.js": 6782,
	"./nl.js": 302,
	"./nn": 3501,
	"./nn.js": 3501,
	"./oc-lnc": 563,
	"./oc-lnc.js": 563,
	"./pa-in": 869,
	"./pa-in.js": 869,
	"./pl": 5302,
	"./pl.js": 5302,
	"./pt": 9687,
	"./pt-br": 4884,
	"./pt-br.js": 4884,
	"./pt.js": 9687,
	"./ro": 5773,
	"./ro.js": 5773,
	"./ru": 3627,
	"./ru.js": 3627,
	"./sd": 355,
	"./sd.js": 355,
	"./se": 3427,
	"./se.js": 3427,
	"./si": 1848,
	"./si.js": 1848,
	"./sk": 4590,
	"./sk.js": 4590,
	"./sl": 184,
	"./sl.js": 184,
	"./sq": 6361,
	"./sq.js": 6361,
	"./sr": 8965,
	"./sr-cyrl": 1287,
	"./sr-cyrl.js": 1287,
	"./sr.js": 8965,
	"./ss": 5456,
	"./ss.js": 5456,
	"./sv": 451,
	"./sv.js": 451,
	"./sw": 7558,
	"./sw.js": 7558,
	"./ta": 1356,
	"./ta.js": 1356,
	"./te": 3693,
	"./te.js": 3693,
	"./tet": 1243,
	"./tet.js": 1243,
	"./tg": 2500,
	"./tg.js": 2500,
	"./th": 5768,
	"./th.js": 5768,
	"./tk": 7761,
	"./tk.js": 7761,
	"./tl-ph": 5780,
	"./tl-ph.js": 5780,
	"./tlh": 9590,
	"./tlh.js": 9590,
	"./tr": 3807,
	"./tr.js": 3807,
	"./tzl": 3857,
	"./tzl.js": 3857,
	"./tzm": 654,
	"./tzm-latn": 8806,
	"./tzm-latn.js": 8806,
	"./tzm.js": 654,
	"./ug-cn": 845,
	"./ug-cn.js": 845,
	"./uk": 9232,
	"./uk.js": 9232,
	"./ur": 7052,
	"./ur.js": 7052,
	"./uz": 7967,
	"./uz-latn": 2233,
	"./uz-latn.js": 2233,
	"./uz.js": 7967,
	"./vi": 8615,
	"./vi.js": 8615,
	"./x-pseudo": 2320,
	"./x-pseudo.js": 2320,
	"./yo": 1313,
	"./yo.js": 1313,
	"./zh-cn": 4490,
	"./zh-cn.js": 4490,
	"./zh-hk": 5910,
	"./zh-hk.js": 5910,
	"./zh-mo": 8262,
	"./zh-mo.js": 8262,
	"./zh-tw": 4223,
	"./zh-tw.js": 4223
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 6700;

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["vendor"], () => (__webpack_exec__(6344), __webpack_exec__(4431)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=main.js.map