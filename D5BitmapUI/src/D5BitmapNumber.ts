//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, MicroGame Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
module d5power {
	/**
	 *
	 * @author 
	 *
	 */
	export class D5BitmapNumber extends D5Component {

        private data:D5UIResourceData;
        private _align: number = 0;
        private _box: D5HBox;
        private _numic: any;
		public constructor() {
            super();
            this._box = new D5HBox();
//            this._box.setPadding(0);
            this._numic = {};
            this.addChild(this._box);
		}
		
		public setAlign(v:number):void
		{
            this._align = v;
		}

        public setSkin(name:string):void
        {
            if(this._nowName == name) return;
            this._nowName = name;
            this.data = D5UIResourceData.getData(name);
            if(this.data==null)
            {
                trace("[D5Button]No Resource"+name);
                return;
            }
		}

		public setValue(v:number):void
		{
            var str: string = v + '';
            var len: number = str.length;

            var bitmap: egret.Bitmap;
            var pnumber: string;
            this._box.removeChildren();
            for(var i: number = 0;i < len;i++){
                pnumber = str.substr(i,1);
                bitmap = <egret.Bitmap>this._numic[i];
                if(!bitmap) 
                {
                    bitmap = new egret.Bitmap();
                    this._numic[i] = bitmap;
                }
                bitmap.texture = this.data.getResource(parseInt(pnumber))
                this._box.addChild(bitmap);
            }
            
            this.invalidate();
		}

        public setPadding(v:number):void
        {
            this._box.setPadding(v);
            this.invalidate();
        }
		
		public draw():void
		{
            switch(this._align)
            {
                case D5Text.CENTER:
                this._box.x = -this._box.width >> 1;
                break;
                case D5Text.RIGHT:
                this._box.x = -this._box.width;
                break;
            }
            super.draw();
		}
		public dispose():void
		{
		    this.data = null;	    
		    if(this._box)
            {
                if(this._box.parent)this._box.parent.removeChild(this._box);
                this._box.dispose();
        		    this._box = null;
            }
		}
	}
}
