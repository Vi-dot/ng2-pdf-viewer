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
        this._showAll = false;
        this._renderText = true;
        this._renderAnnotation = true;
        this._originalSize = true;
        this._page = 1;
        this._zoom = 1;
        this.wasInvalidPage = false;
        this._rotation = 0;
        this.isInitialised = false;
        this.pageChange = new core_1.EventEmitter(true);
    }
    PdfViewerComponent.prototype.ngOnInit = function () {
        this.main();
        this.isInitialised = true;
    };
    Object.defineProperty(PdfViewerComponent.prototype, "src", {
        set: function (_src) {
            this._src = _src;
            if (this.isInitialised) {
                this.main();
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
                this.renderPage(_page);
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "renderAnnotation", {
        set: function (renderAnnotation) {
            this._renderAnnotation = renderAnnotation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "originalSize", {
        set: function (originalSize) {
            this._originalSize = originalSize;
            if (this._pdf) {
                this.main();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "showAll", {
        set: function (value) {
            this._showAll = value;
            if (this._pdf) {
                this.main();
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
                this.main();
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
                this.main();
            }
        },
        enumerable: true,
        configurable: true
    });
    PdfViewerComponent.prototype.main = function () {
        if (this._pdf && this.lastLoaded === this._src) {
            return this.onRender();
        }
        this.loadPDF(this._src);
    };
    PdfViewerComponent.prototype.loadPDF = function (src) {
        var _this = this;
        PDFJS.workerSrc = 'lib/pdfjs-dist/build/pdf.worker.js';
        window.PDFJS.getDocument(src).then(function (pdf) {
            _this._pdf = pdf;
            _this.lastLoaded = src;
            if (_this.afterLoadComplete && typeof _this.afterLoadComplete === 'function') {
                _this.afterLoadComplete(pdf);
            }
            _this.onRender();
        });
    };
    PdfViewerComponent.prototype.onRender = function () {
        if (!this.isValidPageNumber(this._page)) {
            this._page = 1;
        }
        if (!this._showAll) {
            return this.renderPage(this._page);
        }
        this.renderMultiplePages();
    };
    PdfViewerComponent.prototype.renderMultiplePages = function () {
        var _this = this;
        var container = this.element.nativeElement.querySelector('div');
        var page = 1;
        var renderPageFn = function (page) { return function () { return _this.renderPage(page); }; };
        this.removeAllChildNodes(container);
        var d = this.renderPage(page++);
        for (page; page <= this._pdf.numPages; page++) {
            d = d.then(renderPageFn(page));
        }
    };
    PdfViewerComponent.prototype.isValidPageNumber = function (page) {
        return this._pdf.numPages >= page && page >= 1;
    };
    PdfViewerComponent.prototype.renderPage = function (pageNumber) {
        var _this = this;
        return this._pdf.getPage(pageNumber).then(function (page) {
            var scale = _this._zoom;
            var viewport = page.getViewport(_this._zoom, _this._rotation);
            var container = _this.element.nativeElement.querySelector('div');
            if (!_this._originalSize) {
                scale = _this._zoom * (_this.element.nativeElement.offsetWidth / page.getViewport(1).width) / PdfViewerComponent.CSS_UNITS;
                viewport = page.getViewport(scale, _this._rotation);
            }
            if (!_this._showAll) {
                _this.removeAllChildNodes(container);
            }
            var pdfOptions = {
                container: container,
                id: pageNumber,
                scale: scale,
                defaultViewport: viewport
            };
            if (_this._renderText) {
                pdfOptions['textLayerFactory'] = new PDFJS.DefaultTextLayerFactory();
            }
            if (_this._renderAnnotation) {
                pdfOptions['annotationLayerFactory'] = new PDFJS.DefaultAnnotationLayerFactory();
            }
            var pdfPageView = new PDFJS.PDFPageView(pdfOptions);
            pdfPageView.setPdfPage(page);
            _this._pageViews.push(pdfPageView);
            return pdfPageView.draw();
        });
    };
    PdfViewerComponent.prototype.removeAllChildNodes = function (element) {
        this._pageViews = [];
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    };
    PdfViewerComponent.prototype.refreshSize = function () {
        if (!this._originalSize) {
            for (var _i = 0, _a = this._pageViews; _i < _a.length; _i++) {
                var pageView = _a[_i];
                var scale = this._zoom * (this.element.nativeElement.offsetWidth / pageView.pdfPage.getViewport(1).width)
                    / PdfViewerComponent.CSS_UNITS;
                pageView.update(scale, this._rotation);
            }
        }
    };
    PdfViewerComponent.CSS_UNITS = 96.0 / 72.0;
    __decorate([
        core_1.Input('after-load-complete'), 
        __metadata('design:type', Function)
    ], PdfViewerComponent.prototype, "afterLoadComplete", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], PdfViewerComponent.prototype, "src", null);
    __decorate([
        core_1.Input(), 
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
        core_1.Input('render-annotation'), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], PdfViewerComponent.prototype, "renderAnnotation", null);
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
        core_1.Input('zoom'), 
        __metadata('design:type', Number), 
        __metadata('design:paramtypes', [Number])
    ], PdfViewerComponent.prototype, "zoom", null);
    __decorate([
        core_1.Input('rotation'), 
        __metadata('design:type', Number), 
        __metadata('design:paramtypes', [Number])
    ], PdfViewerComponent.prototype, "rotation", null);
    PdfViewerComponent = __decorate([
        core_1.Component({
            selector: 'pdf-viewer',
            template: "<div class=\"ng2-pdf-viewer-container\" [ngClass]=\"{'ng2-pdf-viewer--zoom': zoom < 1}\"></div>",
            styles: ["\n.ng2-pdf-viewer--zoom {\n  overflow-x: scroll;\n}\n\n:host >>> .ng2-pdf-viewer-container > div {\n  position: relative;\n}\n\n:host >>> .textLayer {\n  position: absolute;\n  margin-left: auto;\n  margin-right: auto;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  color: #000;\n  font-family: sans-serif;\n  overflow: hidden;\n}\n  "]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], PdfViewerComponent);
    return PdfViewerComponent;
}(core_1.OnInit));
exports.PdfViewerComponent = PdfViewerComponent;
//# sourceMappingURL=pdf-viewer.component.js.map