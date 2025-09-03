import { NgModule } from '@angular/core';

import { ImgFallbackDirective } from './src-fallback.directive';

@NgModule({
    declarations: [ImgFallbackDirective],
    exports: [ImgFallbackDirective]
})
export class ImgFallbackModule {}
