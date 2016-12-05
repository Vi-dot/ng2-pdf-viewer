/**
 * Created by vadimdez on 21/06/16.
 */
import {
  Component, Input, Output, ElementRef, EventEmitter, OnInit
} from '@angular/core';
import 'pdfjs-dist/build/pdf.combined';
import 'pdfjs-dist/web/pdf_viewer';

@Component({
  selector: 'pdf-viewer',
  template: `<div class="ng2-pdf-viewer-container" [ngClass]="{'ng2-pdf-viewer--zoom': zoom < 1}"></div>`,
  styles: [`
.ng2-pdf-viewer--zoom {
  overflow-x: scroll;
}

:host >>> .ng2-pdf-viewer-container > div {
  position: relative;
}

:host >>> .textLayer {
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  color: #000;
  font-family: sans-serif;
  overflow: hidden;
}
  `]
})

export class PdfViewerComponent extends OnInit {
  private static CSS_UNITS: number = 96.0 / 72.0;

  private _showAll: boolean = false;
  private _renderText: boolean = true;
  private _renderAnnotation: boolean = true;
  private _originalSize: boolean = true;
  private _src: any;
  private _pdf: any;
  private _page: number = 1;
  private _zoom: number = 1;
  private wasInvalidPage: boolean = false;
  private _rotation: number = 0;
  private isInitialised: boolean = false;
  private lastLoaded: string;
  @Input('after-load-complete') afterLoadComplete: Function;

  constructor(private element: ElementRef) {
    super();
  }

  ngOnInit() {
    this.main();
    this.isInitialised = true;
  }

  @Input()
  set src(_src) {
    this._src = _src;

    if (this.isInitialised) {
      this.main();
    }
  }

  @Input()
  set page(_page) {
    _page = parseInt(_page, 10);

    if (!this._pdf) {
      this._page = _page;
      return;
    }

    if (this.isValidPageNumber(_page)) {
      this._page = _page;
      this.renderPage(_page);
      this.wasInvalidPage = false;
    } else if (isNaN(_page)) {
      this.pageChange.emit(null);
    } else if (!this.wasInvalidPage) {
      this.wasInvalidPage = true;
      this.pageChange.emit(this._page);
    }
  }

  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>(true);

  @Input('render-text')
  set renderText(renderText) {
    this._renderText = renderText;
  }

  @Input('render-annotation')
  set renderAnnotation(renderAnnotation) {
    this._renderAnnotation = renderAnnotation;
  }

  @Input('original-size')
  set originalSize(originalSize: boolean) {
    this._originalSize = originalSize;

    if (this._pdf) {
      this.main();
    }
  }

  @Input('show-all')
  set showAll(value: boolean) {
    this._showAll = value;

    if (this._pdf) {
      this.main();
    }
  }

  @Input('zoom')
  set zoom(value: number) {
    if (value <= 0) {
      return;
    }

    this._zoom = value;

    if (this._pdf) {
      this.main();
    }
  }

  get zoom() {
    return this._zoom;
  }

  @Input('rotation')
  set rotation(value: number) {
    if (!(typeof value === 'number' && value % 90 === 0)) {
      console.warn('Invalid pages rotation angle.');
      return;
    }

    this._rotation = value;

    if (this._pdf) {
      this.main();
    }
  }

  private main() {
    if (this._pdf && this.lastLoaded === this._src) {
      return this.onRender();
    }

    this.loadPDF(this._src);
  }

  private loadPDF(src) {
    PDFJS.workerSrc = 'lib/pdfjs-dist/build/pdf.worker.js';

    (<any>window).PDFJS.getDocument(src).then((pdf: PDFDocumentProxy) => {
      this._pdf = pdf;
      this.lastLoaded = src;

      if (this.afterLoadComplete && typeof this.afterLoadComplete === 'function') {
        this.afterLoadComplete(pdf);
      }

      this.onRender();
    });
  }

  private onRender() {
    if (!this.isValidPageNumber(this._page)) {
      this._page = 1;
    }

    if (!this._showAll) {
      return this.renderPage(this._page);
    }

    this.renderMultiplePages();
  }

  private renderMultiplePages() {
    let container = this.element.nativeElement.querySelector('div');
    let page = 1;
    const renderPageFn = (page: number) => () => this.renderPage(page);

    this.removeAllChildNodes(container);

    let d = this.renderPage(page++);

    for (page; page <= this._pdf.numPages; page++) {
      d = d.then(renderPageFn(page));
    }
  }

  private isValidPageNumber(page: number) {
    return this._pdf.numPages >= page && page >= 1;
  }

  private renderPage(pageNumber: number) {
    return this._pdf.getPage(pageNumber).then((page: PDFPageProxy) => {

      var scale = this._zoom;
      var viewport = page.getViewport(this._zoom, this._rotation);

      let container = this.element.nativeElement.querySelector('div');

      if (!this._originalSize) {
        scale = this._zoom * (this.element.nativeElement.offsetWidth / page.getViewport(1).width) / PdfViewerComponent.CSS_UNITS;
        viewport = page.getViewport(scale, this._rotation);
      }

      if (!this._showAll) {
        this.removeAllChildNodes(container);
      }

      var pdfOptions = {
        container: container,
        id: pageNumber,
        scale: scale,
        defaultViewport: viewport
      };

      if (this._renderText) {
        pdfOptions['textLayerFactory'] = new PDFJS.DefaultTextLayerFactory();
      }

      if (this._renderAnnotation) {
        pdfOptions['annotationLayerFactory'] = new PDFJS.DefaultAnnotationLayerFactory();
      }

      var pdfPageView = new PDFJS.PDFPageView(pdfOptions);
      pdfPageView.setPdfPage(page);
      return pdfPageView.draw();
    });
  }

  private removeAllChildNodes(element: HTMLElement) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
}
