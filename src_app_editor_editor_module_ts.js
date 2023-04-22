"use strict";
(self["webpackChunkSkyGame_Planner"] = self["webpackChunkSkyGame_Planner"] || []).push([["src_app_editor_editor_module_ts"],{

/***/ 4051:
/*!***************************************************************************!*\
  !*** ./src/app/editor/components/dashboard/editor-dashboard.component.ts ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditorDashboardComponent": () => (/* binding */ EditorDashboardComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ 124);


const _c0 = function () {
  return ["/editor/ts"];
};
const _c1 = function () {
  return ["/editor/tree"];
};
const _c2 = function () {
  return ["/editor/shop"];
};
class EditorDashboardComponent {}
EditorDashboardComponent.ɵfac = function EditorDashboardComponent_Factory(t) {
  return new (t || EditorDashboardComponent)();
};
EditorDashboardComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
  type: EditorDashboardComponent,
  selectors: [["app-editor-dashboard"]],
  decls: 6,
  vars: 6,
  consts: [[3, "routerLink"]],
  template: function EditorDashboardComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "a", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "Create TS");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "a", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3, "Create Spirit Tree");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "a", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, "Create Shop");
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](3, _c0));
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](4, _c1));
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](5, _c2));
    }
  },
  dependencies: [_angular_router__WEBPACK_IMPORTED_MODULE_1__.RouterLink],
  styles: ["\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZVJvb3QiOiIifQ== */"]
});

/***/ }),

/***/ 6367:
/*!************************************************************************!*\
  !*** ./src/app/editor/components/editor-shop/editor-shop.component.ts ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditorShopComponent": () => (/* binding */ EditorShopComponent)
/* harmony export */ });
/* harmony import */ var nanoid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! nanoid */ 8170);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ 2508);





function EditorShopComponent_div_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div")(1, "button", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function EditorShopComponent_div_8_Template_button_click_1_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r2);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r1.copyToClipboard("shop"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2, " Copy Shop ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "button", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function EditorShopComponent_div_8_Template_button_click_3_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r2);
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r3.copyToClipboard("iaps"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4, " Copy IAPs ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
}
class EditorShopComponent {
  constructor(_dataService) {
    this._dataService = _dataService;
    this.returning = true;
  }
  shopGuidChanged() {
    if (!this.copyShopGuid) {
      return;
    }
    const shop = this._dataService.guidMap.get(this.copyShopGuid);
    if (!shop) {
      return;
    }
    this.copyShop = shop;
  }
  submit() {
    if (!this.copyShop) {
      return;
    }
    // Copy IAPs
    const iaps = [];
    this.copyShop.iaps?.forEach(iap => {
      iaps.push({
        guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_2__.nanoid)(10),
        name: iap.name,
        price: iap.price,
        returning: this.returning || undefined,
        c: iap.c,
        sc: iap.sc,
        sp: iap.sp,
        items: iap.items ? [...iap.items.map(i => i.guid)] : undefined
      });
    });
    // Copy shop
    const newShop = {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_2__.nanoid)(10),
      type: this.copyShop.type,
      spirit: this.copyShop.spirit?.guid || undefined,
      iaps: iaps.map(iap => iap.guid)
    };
    this.result = {
      shop: newShop,
      iaps
    };
  }
  copyToClipboard(type) {
    let value = this.getForClipboard(type);
    if (!value) {
      return;
    }
    let json = JSON.stringify(value, undefined, 2);
    const startI = json.indexOf('{');
    const endI = json.lastIndexOf('}');
    json = json.substring(startI, endI + 1) + ',';
    navigator.clipboard.writeText(json);
  }
  getForClipboard(type) {
    switch (type) {
      case 'shop':
        return [this.result.shop];
      case 'iaps':
        return this.result.iaps;
      default:
        return [];
    }
  }
}
EditorShopComponent.ɵfac = function EditorShopComponent_Factory(t) {
  return new (t || EditorShopComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_0__.DataService));
};
EditorShopComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
  type: EditorShopComponent,
  selectors: [["app-editor-shop"]],
  decls: 9,
  vars: 3,
  consts: [["type", "text", 3, "ngModel", "ngModelChange"], ["type", "checkbox", 3, "ngModel", "ngModelChange"], ["type", "button", 3, "click"], [4, "ngIf"]],
  template: function EditorShopComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div");
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Shop to copy: ");
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "input", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("ngModelChange", function EditorShopComponent_Template_input_ngModelChange_2_listener($event) {
        return ctx.copyShopGuid = $event;
      })("ngModelChange", function EditorShopComponent_Template_input_ngModelChange_2_listener() {
        return ctx.shopGuidChanged();
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](3, "br");
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4, " Returning IAPs: ");
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "input", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("ngModelChange", function EditorShopComponent_Template_input_ngModelChange_5_listener($event) {
        return ctx.returning = $event;
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "button", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function EditorShopComponent_Template_button_click_6_listener() {
        return ctx.submit();
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7, "Submit");
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](8, EditorShopComponent_div_8_Template, 5, 0, "div", 3);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngModel", ctx.copyShopGuid);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngModel", ctx.returning);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.result);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_3__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.CheckboxControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.NgModel],
  styles: ["\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZVJvb3QiOiIifQ== */"]
});

/***/ }),

/***/ 2236:
/*!************************************************************************************************!*\
  !*** ./src/app/editor/components/editor-traveling-spirit/editor-traveling-spirit.component.ts ***!
  \************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditorTravelingSpiritComponent": () => (/* binding */ EditorTravelingSpiritComponent)
/* harmony export */ });
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! moment */ 6908);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var nanoid__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! nanoid */ 8170);
/* harmony import */ var src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/helpers/node-helper */ 1752);
/* harmony import */ var src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/interfaces/item.interface */ 9037);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var src_app_services_data_json_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/services/data-json.service */ 4425);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/forms */ 2508);









function EditorTravelingSpiritComponent_option_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "option", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const option_r3 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("value", option_r3.guid);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](option_r3.name);
  }
}
function EditorTravelingSpiritComponent_div_13_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function EditorTravelingSpiritComponent_div_13_div_1_Template_div_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r11);
      const node_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
      const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r9.toggleConnection(node_r4, "nw"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, "NW");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const node_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("green", node_r4.nw);
  }
}
function EditorTravelingSpiritComponent_div_13_div_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function EditorTravelingSpiritComponent_div_13_div_4_Template_div_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r15);
      const node_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
      const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r13.toggleConnection(node_r4, "ne"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, "NE");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const node_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("green", node_r4.ne);
  }
}
function EditorTravelingSpiritComponent_div_13_option_10_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const option_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("(", option_r17.level, ")");
  }
}
function EditorTravelingSpiritComponent_div_13_option_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "option", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](3, EditorTravelingSpiritComponent_div_13_option_10_ng_container_3_Template, 2, 1, "ng-container", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const option_r17 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("value", option_r17.guid);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", option_r17.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", option_r17.level);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("(", option_r17.guid, ")");
  }
}
function EditorTravelingSpiritComponent_div_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, EditorTravelingSpiritComponent_div_13_div_1_Template, 2, 2, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function EditorTravelingSpiritComponent_div_13_Template_div_click_2_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r21);
      const node_r4 = restoredCtx.$implicit;
      const ctx_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r20.toggleConnection(node_r4, "n"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3, "N");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](4, EditorTravelingSpiritComponent_div_13_div_4_Template, 2, 2, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6, " Item");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](7, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "select", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("ngModelChange", function EditorTravelingSpiritComponent_div_13_Template_select_ngModelChange_8_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r21);
      const node_r4 = restoredCtx.$implicit;
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](node_r4.item = $event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](9, "option", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](10, EditorTravelingSpiritComponent_div_13_option_10_Template, 6, 4, "option", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](12, " Cost");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](13, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](14, " C:");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](15, "input", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("ngModelChange", function EditorTravelingSpiritComponent_div_13_Template_input_ngModelChange_15_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r21);
      const node_r4 = restoredCtx.$implicit;
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](node_r4.c = $event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](16, " H:");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](17, "input", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("ngModelChange", function EditorTravelingSpiritComponent_div_13_Template_input_ngModelChange_17_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r21);
      const node_r4 = restoredCtx.$implicit;
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](node_r4.h = $event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](18, " AC:");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](19, "input", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("ngModelChange", function EditorTravelingSpiritComponent_div_13_Template_input_ngModelChange_19_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r21);
      const node_r4 = restoredCtx.$implicit;
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](node_r4.ac = $event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const node_r4 = ctx.$implicit;
    const i_r5 = ctx.index;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", i_r5 % 3 === 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("green", node_r4.n);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", i_r5 % 3 === 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngModel", node_r4.item);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r1.itemOptions);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngModel", node_r4.c);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngModel", node_r4.h);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngModel", node_r4.ac);
  }
}
function EditorTravelingSpiritComponent_div_16_Template(rf, ctx) {
  if (rf & 1) {
    const _r27 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div")(1, "button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function EditorTravelingSpiritComponent_div_16_Template_button_click_1_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r27);
      const ctx_r26 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r26.copyToClipboard("ts"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, " Copy TS ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function EditorTravelingSpiritComponent_div_16_Template_button_click_3_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r27);
      const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r28.copyToClipboard("tree"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4, " Copy Tree ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function EditorTravelingSpiritComponent_div_16_Template_button_click_5_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r27);
      const ctx_r29 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r29.copyToClipboard("nodes"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6, " Copy Nodes ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function EditorTravelingSpiritComponent_div_16_Template_button_click_7_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r27);
      const ctx_r30 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r30.copyToClipboard("items"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](8, " Copy Items ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
}
class EditorTravelingSpiritComponent {
  constructor(dataService, dataJsonService) {
    this.dataService = dataService;
    this.dataJsonService = dataJsonService;
    this.spiritOptions = new Array();
    this.itemOptions = new Array();
    this.tsCount = dataService.travelingSpiritConfig.items.length;
    this.spiritOptions = dataService.spiritConfig.items.filter(s => s.type === 'Season').sort((a, b) => a.name.localeCompare(b.name));
    const lastDate = dataService.travelingSpiritConfig.items.at(-1)?.date;
    this.date = moment__WEBPACK_IMPORTED_MODULE_0___default()(lastDate).add(2, 'weeks').isoWeekday(4).format('YYYY-MM-DD');
    this.formNodes = [];
    for (let i = 0; i < 24; i++) {
      this.formNodes.push({
        n: !((i + 2) % 3)
      });
    }
  }
  spiritChanged() {
    this.formNodes.forEach(n => n.item = undefined);
    this.itemOptions = [];
    // Find last nodes
    const lastTs = [...this.dataService.travelingSpiritConfig.items].reverse().find(s => s.spirit.guid === this.spirit);
    const spiritTree = this.dataService.spiritConfig.items.find(s => s.guid === this.spirit)?.tree;
    let existingNodes = [];
    if (lastTs) {
      existingNodes = src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_1__.NodeHelper.all(lastTs.tree.node);
      this.formNodes = this.nodeToFormNodes(lastTs.tree.node);
    } else if (spiritTree) {
      // Filter out season-specifics.
      existingNodes = src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_1__.NodeHelper.all(spiritTree.node).filter(s => {
        if (s.item?.name === 'Season Heart') {
          return false;
        }
        return true;
      });
    }
    // Add items
    this.itemOptions.push({
      guid: 'DON\'T PICK',
      name: '-- SPIRIT ITEMS --',
      type: src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_2__.ItemType.Special
    });
    this.itemOptions.push(...existingNodes.filter(n => n.item).map(n => n.item));
    // Create new items
    this.itemOptions.push({
      guid: 'DON\'T PICK',
      name: '-- NEW ITEMS --',
      type: src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_2__.ItemType.Special
    });
    this.itemOptions.push(this.createWingBuff());
    this.itemOptions.push(this.createHeart());
    this.itemOptions.push(this.createBlessing());
    this.itemOptions.push(this.createBlessing());
    this.itemOptions.push(this.createBlessing());
    this.itemOptions.push(this.createBlessing());
  }
  toggleConnection(node, direction) {
    node[direction] = !node[direction];
  }
  submit() {
    const spirit = this.spiritOptions.find(s => s.guid == this.spirit);
    const tsVisits = this.dataService.travelingSpiritConfig.items.filter(ts => ts.spirit.guid === this.spirit).length;
    if (!spirit) {
      alert('No spirit');
      return;
    }
    const baseNode = this.formNodeToNodes();
    const nodes = src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_1__.NodeHelper.all(baseNode);
    // Create tree
    const tree = {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_6__.nanoid)(10),
      node: nodes[0]
    };
    // Create ts
    const ts = {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_6__.nanoid)(10),
      date: new Date(this.date),
      endDate: moment__WEBPACK_IMPORTED_MODULE_0___default()(this.date).add(4, 'days').toDate(),
      spirit,
      tree,
      number: this.tsCount + 1,
      visit: tsVisits + 1
    };
    console.log('ts generated', ts);
    this.result = ts;
  }
  copyToClipboard(type) {
    let value = this.getForClipboard(type);
    if (!value) {
      return;
    }
    const startI = value.indexOf('{');
    const endI = value.lastIndexOf('}');
    value = value.substring(startI, endI + 1) + ',';
    navigator.clipboard.writeText(value);
  }
  getForClipboard(type) {
    switch (type) {
      case 'ts':
        return this.dataJsonService.travelingSpiritsToJson([this.result]);
      case 'tree':
        return this.dataJsonService.spiritTreesToJson([this.result.tree]);
      case 'nodes':
        return this.dataJsonService.nodesToJson(src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_1__.NodeHelper.all(this.result.tree.node));
      case 'items':
        {
          const nodes = src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_1__.NodeHelper.all(this.result.tree.node);
          const newItems = nodes.filter(n => n.item?.guid && !this.dataService.guidMap.has(n.item.guid)).map(n => n.item);
          return this.dataJsonService.itemsToJson(newItems);
        }
    }
    return undefined;
  }
  getNextThursday() {
    const now = moment__WEBPACK_IMPORTED_MODULE_0___default()();
    now.isoWeekday(4);
    if (now.isoWeek() % 2 === 0) {
      now.add(7, 'days');
    }
    return now.toDate();
  }
  nodeToFormNodes(mainNode) {
    const formNodes = new Array();
    for (let i = 0; i < 24; i++) {
      formNodes.push({});
    }
    const defineNode = (i, node) => {
      formNodes[i] = {
        item: node.item?.guid,
        c: node.c,
        h: node.h,
        ac: node.ac,
        n: !!node.n,
        nw: !!node.nw,
        ne: !!node.ne
      };
      if (node.nw) {
        defineNode(i - 1, node.nw);
      }
      if (node.n) {
        defineNode(i - 3, node.n);
      }
      if (node.ne) {
        defineNode(i + 1, node.ne);
      }
    };
    let i = 22;
    defineNode(i, mainNode);
    return formNodes;
  }
  formNodeToNodes(node, i = 22) {
    const formNode = this.formNodes[i];
    node ??= this.formNodeToNode(formNode);
    if (!formNode) {
      return node;
    }
    // Left (north-west)
    if (formNode.nw) {
      const j = i - 1;
      const relativeNode = this.formNodeToNode(this.formNodes[j]);
      if (relativeNode) {
        node.nw = relativeNode;
      }
      this.formNodeToNodes(relativeNode, j);
    }
    // Top (north)
    if (formNode.n) {
      const j = i - 3;
      const relativeNode = this.formNodeToNode(this.formNodes[j]);
      if (relativeNode) {
        node.n = relativeNode;
      }
      this.formNodeToNodes(relativeNode, j);
    }
    // Right (north-east)
    if (formNode.ne) {
      const j = i + 1;
      const relativeNode = this.formNodeToNode(this.formNodes[j]);
      if (relativeNode) {
        node.ne = relativeNode;
      }
      this.formNodeToNodes(relativeNode, j);
    }
    return node;
  }
  formNodeToNode(formNode) {
    if (!formNode?.item) {
      return undefined;
    }
    return {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_6__.nanoid)(10),
      item: this.itemOptions.find(i => i.guid === formNode.item),
      c: formNode.c,
      h: formNode.h,
      ac: formNode.ac
    };
  }
  createHeart() {
    return {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_6__.nanoid)(10),
      type: src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_2__.ItemType.Special,
      name: 'Heart',
      icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d9/Heart.png'
    };
  }
  createBlessing() {
    return {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_6__.nanoid)(10),
      type: src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_2__.ItemType.Special,
      name: 'Blessing',
      icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8e/5CandlesSpell.png'
    };
  }
  createWingBuff() {
    return {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_6__.nanoid)(10),
      type: src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_2__.ItemType.WingBuff,
      name: 'Wing Buff',
      icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/31/Winglight.png'
    };
  }
}
EditorTravelingSpiritComponent.ɵfac = function EditorTravelingSpiritComponent_Factory(t) {
  return new (t || EditorTravelingSpiritComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_3__.DataService), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](src_app_services_data_json_service__WEBPACK_IMPORTED_MODULE_4__.DataJsonService));
};
EditorTravelingSpiritComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({
  type: EditorTravelingSpiritComponent,
  selectors: [["app-editor-traveling-spirit"]],
  decls: 17,
  vars: 7,
  consts: [[1, "mono", 3, "ngModel", "ngModelChange"], [3, "value", 4, "ngFor", "ngForOf"], ["type", "date", 3, "ngModel", "ngModelChange"], [1, "grid-container"], ["class", "grid-item", 4, "ngFor", "ngForOf"], ["type", "button", 3, "click"], [4, "ngIf"], [3, "value"], [1, "grid-item"], ["class", "grid-item-connection grid-item-nw", 3, "green", "click", 4, "ngIf"], [1, "grid-item-connection", "grid-item-n", 3, "click"], ["class", "grid-item-connection grid-item-ne", 3, "green", "click", 4, "ngIf"], ["value", ""], ["type", "number", 1, "cost", 3, "ngModel", "ngModelChange"], [1, "grid-item-connection", "grid-item-nw", 3, "click"], [1, "grid-item-connection", "grid-item-ne", 3, "click"]],
  template: function EditorTravelingSpiritComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "div");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3, " Spirit: ");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "select", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("ngModelChange", function EditorTravelingSpiritComponent_Template_select_ngModelChange_4_listener($event) {
        return ctx.spirit = $event;
      })("ngModelChange", function EditorTravelingSpiritComponent_Template_select_ngModelChange_4_listener() {
        return ctx.spiritChanged();
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](5, EditorTravelingSpiritComponent_option_5_Template, 2, 2, "option", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "div");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](7, " Date: ");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "input", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("ngModelChange", function EditorTravelingSpiritComponent_Template_input_ngModelChange_8_listener($event) {
        return ctx.date = $event;
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "div");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10, " Nodes");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](11, "br");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](13, EditorTravelingSpiritComponent_div_13_Template, 20, 9, "div", 4);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](14, "button", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function EditorTravelingSpiritComponent_Template_button_click_14_listener() {
        return ctx.submit();
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](15, "Generate");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](16, EditorTravelingSpiritComponent_div_16_Template, 9, 0, "div", 6);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate2"](" There are currently ", ctx.tsCount, " TS registered. Add #", ctx.tsCount + 1, " now.\n");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngModel", ctx.spirit);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx.spiritOptions);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngModel", ctx.date);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx.formNodes);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.result);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_7__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_7__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NgSelectOption, _angular_forms__WEBPACK_IMPORTED_MODULE_8__["ɵNgSelectMultipleOption"], _angular_forms__WEBPACK_IMPORTED_MODULE_8__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NumberValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.SelectControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NgModel],
  styles: [".grid-container[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-gap: 10px;\n}\n.grid-item[_ngcontent-%COMP%] {\n  position: relative;\n  background-color: #333;\n  padding: var(--padding-content);\n  padding-top: 25px;\n  text-align: center;\n}\n.grid-item-connection[_ngcontent-%COMP%] {\n  position: absolute;\n  background: #800;\n  top: 0;\n  padding: 2px;\n  line-height: 16px;\n}\n.grid-item-connection.green[_ngcontent-%COMP%] {\n  background: #080;\n}\n.grid-item-nw[_ngcontent-%COMP%] {\n  left: 0;\n}\n.grid-item-n[_ngcontent-%COMP%] {\n  left: 50%;\n  transform: translateX(-50%);\n}\n.grid-item-ne[_ngcontent-%COMP%] {\n  right: 0;\n}\n.cost[_ngcontent-%COMP%] {\n  width: 60px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvZWRpdG9yL2NvbXBvbmVudHMvZWRpdG9yLXRyYXZlbGluZy1zcGlyaXQvZWRpdG9yLXRyYXZlbGluZy1zcGlyaXQuY29tcG9uZW50Lmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFBO0VBQ0EscUNBQUE7RUFFQSxjQUFBO0FBQUY7QUFHQTtFQUNFLGtCQUFBO0VBQ0Esc0JBQUE7RUFDQSwrQkFBQTtFQUNBLGlCQUFBO0VBQ0Esa0JBQUE7QUFERjtBQUlBO0VBQ0Usa0JBQUE7RUFDQSxnQkFBQTtFQUNBLE1BQUE7RUFDQSxZQUFBO0VBQ0EsaUJBQUE7QUFGRjtBQUlFO0VBQ0UsZ0JBQUE7QUFGSjtBQU1BO0VBQ0UsT0FBQTtBQUpGO0FBT0E7RUFDRSxTQUFBO0VBQ0EsMkJBQUE7QUFMRjtBQVFBO0VBQ0UsUUFBQTtBQU5GO0FBU0E7RUFDRSxXQUFBO0FBUEYiLCJzb3VyY2VzQ29udGVudCI6WyIuZ3JpZC1jb250YWluZXIge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAxZnIpO1xuICAvLyBncmlkLXRlbXBsYXRlLXJvd3M6IHJlcGVhdCg4LCAxZnIpO1xuICBncmlkLWdhcDogMTBweDtcbn1cblxuLmdyaWQtaXRlbSB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgYmFja2dyb3VuZC1jb2xvcjogIzMzMztcbiAgcGFkZGluZzogdmFyKC0tcGFkZGluZy1jb250ZW50KTtcbiAgcGFkZGluZy10b3A6IDI1cHg7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbn1cblxuLmdyaWQtaXRlbS1jb25uZWN0aW9uIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBiYWNrZ3JvdW5kOiAjODAwO1xuICB0b3A6IDA7XG4gIHBhZGRpbmc6IDJweDtcbiAgbGluZS1oZWlnaHQ6IDE2cHg7XG5cbiAgJi5ncmVlbiB7XG4gICAgYmFja2dyb3VuZDogIzA4MDtcbiAgfVxufVxuXG4uZ3JpZC1pdGVtLW53IHtcbiAgbGVmdDogMDtcbn1cblxuLmdyaWQtaXRlbS1uIHtcbiAgbGVmdDogNTAlO1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XG59XG5cbi5ncmlkLWl0ZW0tbmUge1xuICByaWdodDogMDtcbn1cblxuLmNvc3Qge1xuICB3aWR0aDogNjBweDtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
});

/***/ }),

/***/ 8532:
/*!************************************************************************!*\
  !*** ./src/app/editor/components/editor-tree/editor-tree.component.ts ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditorTreeComponent": () => (/* binding */ EditorTreeComponent)
/* harmony export */ });
/* harmony import */ var nanoid__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! nanoid */ 8170);
/* harmony import */ var src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/helpers/node-helper */ 1752);
/* harmony import */ var src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/interfaces/item.interface */ 9037);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_data_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/data.service */ 2468);
/* harmony import */ var src_app_services_data_json_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/data-json.service */ 4425);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/forms */ 2508);









function EditorTreeComponent_div_4_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function EditorTreeComponent_div_4_div_1_Template_div_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r9);
      const node_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
      const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r7.toggleConnection(node_r2, "nw"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, "NW");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const node_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("green", node_r2.nw);
  }
}
function EditorTreeComponent_div_4_div_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function EditorTreeComponent_div_4_div_4_Template_div_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r13);
      const node_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
      const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r11.toggleConnection(node_r2, "ne"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, "NE");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const node_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("green", node_r2.ne);
  }
}
function EditorTreeComponent_div_4_option_11_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const option_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("(", option_r15.level, ")");
  }
}
function EditorTreeComponent_div_4_option_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "option", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](3, EditorTreeComponent_div_4_option_11_ng_container_3_Template, 2, 1, "ng-container", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const option_r15 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", option_r15.guid);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", option_r15.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", option_r15.level);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("(", option_r15.guid, ")");
  }
}
function EditorTreeComponent_div_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, EditorTreeComponent_div_4_div_1_Template, 2, 2, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function EditorTreeComponent_div_4_Template_div_click_2_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r19);
      const node_r2 = restoredCtx.$implicit;
      const ctx_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r18.toggleConnection(node_r2, "n"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3, "N");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](4, EditorTreeComponent_div_4_div_4_Template, 2, 2, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6, " Item");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](7, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](8, "input", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("input", function EditorTreeComponent_div_4_Template_input_input_8_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r19);
      const i_r3 = restoredCtx.index;
      const ctx_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r20.itemInputChanged($event, i_r3));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "select", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngModelChange", function EditorTreeComponent_div_4_Template_select_ngModelChange_9_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r19);
      const node_r2 = restoredCtx.$implicit;
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](node_r2.item = $event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](10, "option", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](11, EditorTreeComponent_div_4_option_11_Template, 6, 4, "option", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](12, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](13, " Cost");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](14, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](15, " C:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](16, "input", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngModelChange", function EditorTreeComponent_div_4_Template_input_ngModelChange_16_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r19);
      const node_r2 = restoredCtx.$implicit;
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](node_r2.c = $event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](17, " H:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](18, "input", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngModelChange", function EditorTreeComponent_div_4_Template_input_ngModelChange_18_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r19);
      const node_r2 = restoredCtx.$implicit;
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](node_r2.h = $event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](19, " AC:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](20, "input", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngModelChange", function EditorTreeComponent_div_4_Template_input_ngModelChange_20_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r19);
      const node_r2 = restoredCtx.$implicit;
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](node_r2.ac = $event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const node_r2 = ctx.$implicit;
    const i_r3 = ctx.index;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", i_r3 % 3 === 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("green", node_r2.n);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", i_r3 % 3 === 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngModel", node_r2.item);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r0.itemOptions);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngModel", node_r2.c);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngModel", node_r2.h);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngModel", node_r2.ac);
  }
}
function EditorTreeComponent_div_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r26 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div")(1, "button", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function EditorTreeComponent_div_7_Template_button_click_1_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r26);
      const ctx_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r25.copyToClipboard("tree"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, " Copy Tree ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "button", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function EditorTreeComponent_div_7_Template_button_click_3_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r26);
      const ctx_r27 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r27.copyToClipboard("nodes"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4, " Copy Nodes ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "button", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function EditorTreeComponent_div_7_Template_button_click_5_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r26);
      const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r28.copyToClipboard("items"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6, " Copy Items ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
}
class EditorTreeComponent {
  constructor(_dataService, _dataJsonService, _route) {
    this._dataService = _dataService;
    this._dataJsonService = _dataJsonService;
    this._route = _route;
    this.itemOptions = new Array();
    this.formNodes = [];
    for (let i = 0; i < 24; i++) {
      this.formNodes.push({
        n: !((i + 2) % 3)
      });
    }
  }
  ngOnInit() {
    this.formNodes.forEach(n => n.item = undefined);
    const copyTree = this._route.snapshot.queryParams['copy'];
    if (copyTree) {
      const tree = this._dataService.guidMap.get(copyTree);
      this.formNodes = this.nodeToFormNodes(tree.node);
    }
    this.itemOptions = [];
    // Add items
    this.itemOptions.push(...this._dataService.itemConfig.items);
    // Create new items
    this.itemOptions.push({
      guid: 'DON\'T PICK',
      name: '-- NEW ITEMS --',
      type: src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_1__.ItemType.Special
    });
    this.itemOptions.push(this.createWingBuff());
    this.itemOptions.push(this.createHeart());
    this.itemOptions.push(this.createBlessing());
    this.itemOptions.push(this.createBlessing());
    this.itemOptions.push(this.createBlessing());
    this.itemOptions.push(this.createBlessing());
  }
  toggleConnection(node, direction) {
    node[direction] = !node[direction];
  }
  itemInputChanged(event, i) {
    const target = event.target;
    const value = target?.value;
    if (!value) {
      return;
    }
    const item = this._dataService.guidMap.get(value);
    if (!item) {
      return;
    }
    target.value = '';
    this.formNodes[i].item = item.guid;
    target.blur();
  }
  submit() {
    const baseNode = this.formNodeToNodes();
    const nodes = src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__.NodeHelper.all(baseNode);
    // Create tree
    const tree = {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_5__.nanoid)(10),
      node: nodes[0]
    };
    console.log('tree generated', tree);
    this.result = tree;
  }
  copyToClipboard(type) {
    let value = this.getForClipboard(type);
    if (!value) {
      return;
    }
    const startI = value.indexOf('{');
    const endI = value.lastIndexOf('}');
    value = value.substring(startI, endI + 1) + ',';
    navigator.clipboard.writeText(value);
  }
  getForClipboard(type) {
    switch (type) {
      case 'tree':
        return this._dataJsonService.spiritTreesToJson([this.result]);
      case 'nodes':
        return this._dataJsonService.nodesToJson(src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__.NodeHelper.all(this.result.node));
      case 'items':
        {
          const nodes = src_app_helpers_node_helper__WEBPACK_IMPORTED_MODULE_0__.NodeHelper.all(this.result.node);
          const newItems = nodes.filter(n => n.item?.guid && !this._dataService.guidMap.has(n.item.guid)).map(n => n.item);
          return this._dataJsonService.itemsToJson(newItems);
        }
    }
    return undefined;
  }
  nodeToFormNodes(mainNode) {
    const formNodes = new Array();
    for (let i = 0; i < 24; i++) {
      formNodes.push({});
    }
    const defineNode = (i, node) => {
      formNodes[i] = {
        item: node.item?.guid,
        c: node.c,
        h: node.h,
        ac: node.ac,
        n: !!node.n,
        nw: !!node.nw,
        ne: !!node.ne
      };
      if (node.nw) {
        defineNode(i - 1, node.nw);
      }
      if (node.n) {
        defineNode(i - 3, node.n);
      }
      if (node.ne) {
        defineNode(i + 1, node.ne);
      }
    };
    let i = 22;
    defineNode(i, mainNode);
    return formNodes;
  }
  formNodeToNodes(node, i = 22) {
    const formNode = this.formNodes[i];
    node ??= this.formNodeToNode(formNode);
    if (!formNode) {
      return node;
    }
    // Left (north-west)
    if (formNode.nw) {
      const j = i - 1;
      const relativeNode = this.formNodeToNode(this.formNodes[j]);
      if (relativeNode) {
        node.nw = relativeNode;
      }
      this.formNodeToNodes(relativeNode, j);
    }
    // Top (north)
    if (formNode.n) {
      const j = i - 3;
      const relativeNode = this.formNodeToNode(this.formNodes[j]);
      if (relativeNode) {
        node.n = relativeNode;
      }
      this.formNodeToNodes(relativeNode, j);
    }
    // Right (north-east)
    if (formNode.ne) {
      const j = i + 1;
      const relativeNode = this.formNodeToNode(this.formNodes[j]);
      if (relativeNode) {
        node.ne = relativeNode;
      }
      this.formNodeToNodes(relativeNode, j);
    }
    return node;
  }
  formNodeToNode(formNode) {
    if (!formNode?.item) {
      return undefined;
    }
    return {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_5__.nanoid)(10),
      item: this.itemOptions.find(i => i.guid === formNode.item),
      c: formNode.c,
      h: formNode.h,
      ac: formNode.ac
    };
  }
  createHeart() {
    return {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_5__.nanoid)(10),
      type: src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_1__.ItemType.Special,
      name: 'Heart',
      icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d9/Heart.png'
    };
  }
  createBlessing() {
    return {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_5__.nanoid)(10),
      type: src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_1__.ItemType.Special,
      name: 'Blessing',
      icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8e/5CandlesSpell.png'
    };
  }
  createWingBuff() {
    return {
      guid: (0,nanoid__WEBPACK_IMPORTED_MODULE_5__.nanoid)(10),
      type: src_app_interfaces_item_interface__WEBPACK_IMPORTED_MODULE_1__.ItemType.WingBuff,
      name: 'Wing Buff',
      icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/31/Winglight.png'
    };
  }
}
EditorTreeComponent.ɵfac = function EditorTreeComponent_Factory(t) {
  return new (t || EditorTreeComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](src_app_services_data_service__WEBPACK_IMPORTED_MODULE_2__.DataService), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](src_app_services_data_json_service__WEBPACK_IMPORTED_MODULE_3__.DataJsonService), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.ActivatedRoute));
};
EditorTreeComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({
  type: EditorTreeComponent,
  selectors: [["app-editor-tree-spirit"]],
  decls: 8,
  vars: 2,
  consts: [[1, "grid-container"], ["class", "grid-item", 4, "ngFor", "ngForOf"], ["type", "button", 3, "click"], [4, "ngIf"], [1, "grid-item"], ["class", "grid-item-connection grid-item-nw", 3, "green", "click", 4, "ngIf"], [1, "grid-item-connection", "grid-item-n", 3, "click"], ["class", "grid-item-connection grid-item-ne", 3, "green", "click", 4, "ngIf"], [3, "input"], [1, "mono", 3, "ngModel", "ngModelChange"], ["value", ""], [3, "value", 4, "ngFor", "ngForOf"], ["type", "number", 1, "cost", 3, "ngModel", "ngModelChange"], [1, "grid-item-connection", "grid-item-nw", 3, "click"], [1, "grid-item-connection", "grid-item-ne", 3, "click"], [3, "value"]],
  template: function EditorTreeComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, " Nodes");
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](2, "br");
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "div", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](4, EditorTreeComponent_div_4_Template, 21, 9, "div", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "button", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function EditorTreeComponent_Template_button_click_5_listener() {
        return ctx.submit();
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6, "Generate");
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](7, EditorTreeComponent_div_7_Template, 7, 0, "div", 3);
    }
    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.formNodes);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.result);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_7__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_7__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NgSelectOption, _angular_forms__WEBPACK_IMPORTED_MODULE_8__["ɵNgSelectMultipleOption"], _angular_forms__WEBPACK_IMPORTED_MODULE_8__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NumberValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.SelectControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NgModel],
  styles: [".grid-container[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-gap: 10px;\n}\n.grid-item[_ngcontent-%COMP%] {\n  position: relative;\n  background-color: #333;\n  padding: var(--padding-content);\n  padding-top: 25px;\n  text-align: center;\n}\n.grid-item-connection[_ngcontent-%COMP%] {\n  position: absolute;\n  background: #800;\n  top: 0;\n  padding: 2px;\n  line-height: 16px;\n}\n.grid-item-connection.green[_ngcontent-%COMP%] {\n  background: #080;\n}\n.grid-item-nw[_ngcontent-%COMP%] {\n  left: 0;\n}\n.grid-item-n[_ngcontent-%COMP%] {\n  left: 50%;\n  transform: translateX(-50%);\n}\n.grid-item-ne[_ngcontent-%COMP%] {\n  right: 0;\n}\n.cost[_ngcontent-%COMP%] {\n  width: 60px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvZWRpdG9yL2NvbXBvbmVudHMvZWRpdG9yLXRyZWUvZWRpdG9yLXRyZWUuY29tcG9uZW50Lmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFBO0VBQ0EscUNBQUE7RUFFQSxjQUFBO0FBQUY7QUFHQTtFQUNFLGtCQUFBO0VBQ0Esc0JBQUE7RUFDQSwrQkFBQTtFQUNBLGlCQUFBO0VBQ0Esa0JBQUE7QUFERjtBQUlBO0VBQ0Usa0JBQUE7RUFDQSxnQkFBQTtFQUNBLE1BQUE7RUFDQSxZQUFBO0VBQ0EsaUJBQUE7QUFGRjtBQUlFO0VBQ0UsZ0JBQUE7QUFGSjtBQU1BO0VBQ0UsT0FBQTtBQUpGO0FBT0E7RUFDRSxTQUFBO0VBQ0EsMkJBQUE7QUFMRjtBQVFBO0VBQ0UsUUFBQTtBQU5GO0FBU0E7RUFDRSxXQUFBO0FBUEYiLCJzb3VyY2VzQ29udGVudCI6WyIuZ3JpZC1jb250YWluZXIge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAxZnIpO1xuICAvLyBncmlkLXRlbXBsYXRlLXJvd3M6IHJlcGVhdCg4LCAxZnIpO1xuICBncmlkLWdhcDogMTBweDtcbn1cblxuLmdyaWQtaXRlbSB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgYmFja2dyb3VuZC1jb2xvcjogIzMzMztcbiAgcGFkZGluZzogdmFyKC0tcGFkZGluZy1jb250ZW50KTtcbiAgcGFkZGluZy10b3A6IDI1cHg7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbn1cblxuLmdyaWQtaXRlbS1jb25uZWN0aW9uIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBiYWNrZ3JvdW5kOiAjODAwO1xuICB0b3A6IDA7XG4gIHBhZGRpbmc6IDJweDtcbiAgbGluZS1oZWlnaHQ6IDE2cHg7XG5cbiAgJi5ncmVlbiB7XG4gICAgYmFja2dyb3VuZDogIzA4MDtcbiAgfVxufVxuXG4uZ3JpZC1pdGVtLW53IHtcbiAgbGVmdDogMDtcbn1cblxuLmdyaWQtaXRlbS1uIHtcbiAgbGVmdDogNTAlO1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XG59XG5cbi5ncmlkLWl0ZW0tbmUge1xuICByaWdodDogMDtcbn1cblxuLmNvc3Qge1xuICB3aWR0aDogNjBweDtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
});

/***/ }),

/***/ 8243:
/*!*************************************************!*\
  !*** ./src/app/editor/editor-routing.module.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditorRoutingModule": () => (/* binding */ EditorRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _components_dashboard_editor_dashboard_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/dashboard/editor-dashboard.component */ 4051);
/* harmony import */ var _components_editor_traveling_spirit_editor_traveling_spirit_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/editor-traveling-spirit/editor-traveling-spirit.component */ 2236);
/* harmony import */ var _components_editor_tree_editor_tree_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/editor-tree/editor-tree.component */ 8532);
/* harmony import */ var _components_editor_shop_editor_shop_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/editor-shop/editor-shop.component */ 6367);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 2560);







const routes = [{
  path: '',
  component: _components_dashboard_editor_dashboard_component__WEBPACK_IMPORTED_MODULE_0__.EditorDashboardComponent
}, {
  path: 'ts',
  component: _components_editor_traveling_spirit_editor_traveling_spirit_component__WEBPACK_IMPORTED_MODULE_1__.EditorTravelingSpiritComponent
}, {
  path: 'tree',
  component: _components_editor_tree_editor_tree_component__WEBPACK_IMPORTED_MODULE_2__.EditorTreeComponent
}, {
  path: 'shop',
  component: _components_editor_shop_editor_shop_component__WEBPACK_IMPORTED_MODULE_3__.EditorShopComponent
}];
class EditorRoutingModule {}
EditorRoutingModule.ɵfac = function EditorRoutingModule_Factory(t) {
  return new (t || EditorRoutingModule)();
};
EditorRoutingModule.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineNgModule"]({
  type: EditorRoutingModule
});
EditorRoutingModule.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjector"]({
  imports: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule.forChild(routes), _angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule]
});
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵsetNgModuleScope"](EditorRoutingModule, {
    imports: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule],
    exports: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule]
  });
})();

/***/ }),

/***/ 3164:
/*!*****************************************!*\
  !*** ./src/app/editor/editor.module.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditorModule": () => (/* binding */ EditorModule)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _components_dashboard_editor_dashboard_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/dashboard/editor-dashboard.component */ 4051);
/* harmony import */ var _editor_routing_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./editor-routing.module */ 8243);
/* harmony import */ var _components_editor_traveling_spirit_editor_traveling_spirit_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/editor-traveling-spirit/editor-traveling-spirit.component */ 2236);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var _components_editor_tree_editor_tree_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/editor-tree/editor-tree.component */ 8532);
/* harmony import */ var _components_editor_shop_editor_shop_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/editor-shop/editor-shop.component */ 6367);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 2560);








class EditorModule {}
EditorModule.ɵfac = function EditorModule_Factory(t) {
  return new (t || EditorModule)();
};
EditorModule.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineNgModule"]({
  type: EditorModule
});
EditorModule.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjector"]({
  imports: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.FormsModule, _editor_routing_module__WEBPACK_IMPORTED_MODULE_1__.EditorRoutingModule]
});
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsetNgModuleScope"](EditorModule, {
    declarations: [_components_dashboard_editor_dashboard_component__WEBPACK_IMPORTED_MODULE_0__.EditorDashboardComponent, _components_editor_traveling_spirit_editor_traveling_spirit_component__WEBPACK_IMPORTED_MODULE_2__.EditorTravelingSpiritComponent, _components_editor_tree_editor_tree_component__WEBPACK_IMPORTED_MODULE_3__.EditorTreeComponent, _components_editor_shop_editor_shop_component__WEBPACK_IMPORTED_MODULE_4__.EditorShopComponent],
    imports: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.FormsModule, _editor_routing_module__WEBPACK_IMPORTED_MODULE_1__.EditorRoutingModule]
  });
})();

/***/ }),

/***/ 4425:
/*!***********************************************!*\
  !*** ./src/app/services/data-json.service.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DataJsonService": () => (/* binding */ DataJsonService)
/* harmony export */ });
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! moment */ 6908);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);


class DataJsonService {
  constructor() {}
  travelingSpiritsToJson(ts) {
    return this.stringify(ts.map(ts => {
      const date = moment__WEBPACK_IMPORTED_MODULE_0___default()(ts.date);
      return {
        guid: ts.guid,
        date: {
          day: date.date(),
          month: date.month() + 1,
          year: date.year()
        },
        spirit: ts.spirit.guid,
        tree: ts.tree.guid
      };
    }));
  }
  spiritTreesToJson(trees) {
    return this.stringify(trees.map(tree => {
      return {
        guid: tree.guid,
        node: tree.node.guid
      };
    }));
  }
  nodesToJson(nodes) {
    return this.stringify(nodes.map(node => {
      return {
        guid: node.guid,
        item: node.item?.guid,
        c: node.c,
        h: node.h,
        sc: node.sc,
        sh: node.sh,
        ac: node.ac,
        nw: node.nw?.guid,
        n: node.n?.guid,
        ne: node.ne?.guid
      };
    }));
  }
  itemsToJson(items) {
    return this.stringify(items.map(item => {
      return {
        guid: item.guid,
        type: item.type,
        name: item.name,
        icon: item.icon,
        level: item.level
      };
    }));
  }
  stringify(array) {
    return JSON.stringify(array, undefined, 2);
  }
}
DataJsonService.ɵfac = function DataJsonService_Factory(t) {
  return new (t || DataJsonService)();
};
DataJsonService.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
  token: DataJsonService,
  factory: DataJsonService.ɵfac,
  providedIn: 'root'
});

/***/ }),

/***/ 8170:
/*!**********************************************!*\
  !*** ./node_modules/nanoid/index.browser.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "customAlphabet": () => (/* binding */ customAlphabet),
/* harmony export */   "customRandom": () => (/* binding */ customRandom),
/* harmony export */   "nanoid": () => (/* binding */ nanoid),
/* harmony export */   "random": () => (/* binding */ random),
/* harmony export */   "urlAlphabet": () => (/* reexport safe */ _url_alphabet_index_js__WEBPACK_IMPORTED_MODULE_0__.urlAlphabet)
/* harmony export */ });
/* harmony import */ var _url_alphabet_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./url-alphabet/index.js */ 7796);

let random = bytes => crypto.getRandomValues(new Uint8Array(bytes));
let customRandom = (alphabet, defaultSize, getRandom) => {
  let mask = (2 << Math.log(alphabet.length - 1) / Math.LN2) - 1;
  let step = -~(1.6 * mask * defaultSize / alphabet.length);
  return (size = defaultSize) => {
    let id = '';
    while (true) {
      let bytes = getRandom(step);
      let j = step;
      while (j--) {
        id += alphabet[bytes[j] & mask] || '';
        if (id.length === size) return id;
      }
    }
  };
};
let customAlphabet = (alphabet, size = 21) => customRandom(alphabet, size, random);
let nanoid = (size = 21) => crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
  byte &= 63;
  if (byte < 36) {
    id += byte.toString(36);
  } else if (byte < 62) {
    id += (byte - 26).toString(36).toUpperCase();
  } else if (byte > 62) {
    id += '-';
  } else {
    id += '_';
  }
  return id;
}, '');

/***/ }),

/***/ 7796:
/*!***************************************************!*\
  !*** ./node_modules/nanoid/url-alphabet/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "urlAlphabet": () => (/* binding */ urlAlphabet)
/* harmony export */ });
const urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

/***/ })

}]);
//# sourceMappingURL=src_app_editor_editor_module_ts.js.map