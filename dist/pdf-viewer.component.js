"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
require('pdfjs-dist/build/pdf.combined');
require('pdfjs-dist/web/pdf_viewer');
var PdfViewerComponent = (function (_super) {
    __extends(PdfViewerComponent, _super);
    function PdfViewerComponent(element) {
        _super.call(this);
        this.element = element;
        this._showAll = true;
        this._renderText = true;
        this._renderLink = true;
        this._stickToPage = false;
        this._originalSize = true;
        this._page = 1;
        this._zoom = 1;
        this.wasInvalidPage = false;
        this._rotation = 0;
        this.isInitialised = false;
        this._enhanceTextSelection = false;
        this._pageBorder = false;
        this.pageChange = new core_1.EventEmitter(true);
    }
    PdfViewerComponent.prototype.ngOnInit = function () {
        this.setupViewer();
        this.isInitialised = true;
    };
    Object.defineProperty(PdfViewerComponent.prototype, "src", {
        set: function (_src) {
            this._src = _src;
            if (this.isInitialised) {
                this.loadPDF();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "page", {
        set: function (_page) {
            _page = parseInt(_page, 10);
            if (!this._pdf) {
                this._page = _page;
                return;
            }
            if (this.isValidPageNumber(_page)) {
                this._page = _page;
                this.render();
                this.wasInvalidPage = false;
            }
            else if (isNaN(_page)) {
                this.pageChange.emit(null);
            }
            else if (!this.wasInvalidPage) {
                this.wasInvalidPage = true;
                this.pageChange.emit(this._page);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "renderText", {
        set: function (renderText) {
            this._renderText = renderText;
            if (this._pdf) {
                this.setupViewer();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "renderLink", {
        set: function (renderLink) {
            this._renderLink = renderLink;
            if (this._pdf) {
                this.setupViewer();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "originalSize", {
        set: function (originalSize) {
            this._originalSize = originalSize;
            if (this._pdf) {
                this.updateSize();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "showAll", {
        set: function (value) {
            this._showAll = value;
            if (this._pdf) {
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "stickToPage", {
        set: function (value) {
            this._stickToPage = value;
            if (this._pdf) {
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "zoom", {
        get: function () {
            return this._zoom;
        },
        set: function (value) {
            if (value <= 0) {
                return;
            }
            this._zoom = value;
            if (this._pdf) {
                this.updateSize();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "rotation", {
        set: function (value) {
            if (!(typeof value === 'number' && value % 90 === 0)) {
                console.warn('Invalid pages rotation angle.');
                return;
            }
            this._rotation = value;
            if (this._pdf) {
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "pageBorder", {
        set: function (value) {
            this._pageBorder = value;
            if (this._pdf) {
                this.setupViewer();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "enhanceTextSelection", {
        set: function (value) {
            this._enhanceTextSelection = value;
            if (this._pdf) {
                this.setupViewer();
            }
        },
        enumerable: true,
        configurable: true
    });
    PdfViewerComponent.prototype.setupViewer = function () {
        PDFJS.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
        PDFJS.disableTextLayer = !this._renderText;
        var container = this.element.nativeElement.querySelector('div');
        var pdfOptions = {
            container: container
        };
        if (this._renderLink) {
            this._pdfLinkService = new PDFJS.PDFLinkService();
            pdfOptions['linkService'] = this._pdfLinkService;
        }
        if (!this._pageBorder) {
            pdfOptions['removePageBorders'] = true;
        }
        if (this._enhanceTextSelection) {
            pdfOptions['enhanceTextSelection'] = this._enhanceTextSelection;
        }
        this._pdfViewer = new PDFJS.PDFViewer({
            container: container
        });
        if (this._renderLink) {
            this._pdfLinkService.setViewer(this._pdfViewer);
        }
        if (this._src) {
            this.loadPDF();
        }
    };
    PdfViewerComponent.prototype.loadPDF = function (src) {
        var _this = this;
        if (!src) {
            src = this._src;
        }
        if (src) {
            PDFJS.getDocument(src).then(function (pdf) {
                _this._pdf = pdf;
                _this.lastLoaded = src;
                if (_this.afterLoadComplete && typeof _this.afterLoadComplete === 'function') {
                    _this.afterLoadComplete(pdf);
                }
                _this._pdfViewer.setDocument(_this._pdf);
                _this._pdfLinkService.setDocument(_this._pdf, null);
                _this.render();
            });
        }
    };
    PdfViewerComponent.prototype.render = function () {
        if (!this.isValidPageNumber(this._page)) {
            this._page = 1;
        }
        if (this._rotation !== 0 || this._pdfViewer.pagesRotation !== this._rotation) {
            this._pdfViewer.pagesRotation = this._rotation;
        }
        if (this._stickToPage) {
            this._pdfViewer.currentPageNumber = this._page;
        }
        this.updateSize();
    };
    PdfViewerComponent.prototype.updateSize = function () {
        var _this = this;
        if (!this._originalSize) {
            this._pdf.getPage(this._pdfViewer._currentPageNumber).then(function (page) {
                var scale = _this._zoom * (_this.element.nativeElement.offsetWidth / page.getViewport(1).width) / PdfViewerComponent.CSS_UNITS;
                _this._pdfViewer._setScale(scale, !_this._stickToPage);
            });
        }
        else {
            this._pdfViewer._setScale(this._zoom, !this._stickToPage);
        }
    };
    PdfViewerComponent.prototype.isValidPageNumber = function (page) {
        return this._pdf.numPages >= page && page >= 1;
    };
    PdfViewerComponent.CSS_UNITS = 96.0 / 72.0;
    __decorate([
        core_1.Input('after-load-complete'), 
        __metadata('design:type', Function)
    ], PdfViewerComponent.prototype, "afterLoadComplete", void 0);
    __decorate([
        core_1.Input('src'), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], PdfViewerComponent.prototype, "src", null);
    __decorate([
        core_1.Input('page'), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], PdfViewerComponent.prototype, "page", null);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], PdfViewerComponent.prototype, "pageChange", void 0);
    __decorate([
        core_1.Input('render-text'), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], PdfViewerComponent.prototype, "renderText", null);
    __decorate([
        core_1.Input('render-link'), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], PdfViewerComponent.prototype, "renderLink", null);
    __decorate([
        core_1.Input('original-size'), 
        __metadata('design:type', Boolean), 
        __metadata('design:paramtypes', [Boolean])
    ], PdfViewerComponent.prototype, "originalSize", null);
    __decorate([
        core_1.Input('show-all'), 
        __metadata('design:type', Boolean), 
        __metadata('design:paramtypes', [Boolean])
    ], PdfViewerComponent.prototype, "showAll", null);
    __decorate([
        core_1.Input('stick-to-page'), 
        __metadata('design:type', Boolean), 
        __metadata('design:paramtypes', [Boolean])
    ], PdfViewerComponent.prototype, "stickToPage", null);
    __decorate([
        core_1.Input('zoom'), 
        __metadata('design:type', Number), 
        __metadata('design:paramtypes', [Number])
    ], PdfViewerComponent.prototype, "zoom", null);
    __decorate([
        core_1.Input('rotation'), 
        __metadata('design:type', Number), 
        __metadata('design:paramtypes', [Number])
    ], PdfViewerComponent.prototype, "rotation", null);
    __decorate([
        core_1.Input('page-border'), 
        __metadata('design:type', Boolean), 
        __metadata('design:paramtypes', [Boolean])
    ], PdfViewerComponent.prototype, "pageBorder", null);
    __decorate([
        core_1.Input('enhance-text-selection'), 
        __metadata('design:type', Boolean), 
        __metadata('design:paramtypes', [Boolean])
    ], PdfViewerComponent.prototype, "enhanceTextSelection", null);
    PdfViewerComponent = __decorate([
        core_1.Component({
            selector: 'pdf-viewer',
            template: "<div class=\"ng2-pdf-viewer-container\"><div id=\"viewer\" class=\"pdfViewer\"></div></div>",
            styles: ["\n.ng2-pdf-viewer--zoom {\n  overflow-x: scroll;\n}\n\n:host >>> .ng2-pdf-viewer-container > div {\n  position: relative;\n}\n\n:host >>> .textLayer {\n  position: absolute;\n  margin-left: auto;\n  margin-right: auto;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  color: #000;\n  font-family: sans-serif;\n  overflow: hidden;\n}\n  "]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], PdfViewerComponent);
    return PdfViewerComponent;
}(core_1.OnInit));
exports.PdfViewerComponent = PdfViewerComponent;
//# sourceMappingURL=pdf-viewer.component.js.map