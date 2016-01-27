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
module d5power
{
    export class D5MirrorLoop extends D5Component
    {
        private front:egret.Bitmap;

        private enter:egret.Bitmap;

        private after:egret.Bitmap;


        public constructor()
        {
            super();
        }

        public setSkin(name:string):void
        {
            if(this._nowName == name) return;
            this._nowName = name;
            var data:D5UIResourceData = D5UIResourceData.getData(name);
            if(data==null)
            {
                trace("[D5MirrorLoop]No Resource"+name);
                return;
            }

            if(D5UIResourceData._typeLoop == 0)   //x轴D5UIResourceData._typeLoop == 0
            {
                if(this.front==null)this.front = new egret.Bitmap();
                this.front.texture = data.getResource(0);

                if(this.enter==null)this.enter = new egret.Bitmap();
                this.enter.texture = data.getResource(1);
                this.enter.fillMode = egret.BitmapFillMode.REPEAT;

                if(this.after==null)this.after = new egret.Bitmap();
                this.after.texture = data.getResource(0);
                this.after.scaleX = -1;
            }else{

                if(this.front==null)this.front = new egret.Bitmap();
                this.front.texture = data.getResource(0);

                if(this.enter==null)this.enter = new egret.Bitmap();
                this.enter.texture = data.getResource(1);
                this.enter.fillMode = egret.BitmapFillMode.REPEAT;

                if(this.after==null)this.after = new egret.Bitmap();
                this.after.texture = data.getResource(0);
                this.after.scaleY = -1;
            }

            this.invalidate();

        }

        public draw():void
        {
            if(this.front==null)
            {

            }else{

                if(!this.contains(this.front)) {

                    this.addChildAt(this.front,0);
                    this.addChildAt(this.enter,0);
                    this.addChildAt(this.after,0);
                }
            }

            if(D5UIResourceData._typeLoop == 0)
            {
                this.enter.x = this.front.width;
                this.enter.width = this._w - this.front.width * 2;
                this.after.x = this._w;
            }else{
                this.enter.y = this.front.height;
                this.enter.height = this._h - this.front.height * 2;
                this.after.y = this._h;
            }

            super.draw();

        }
        public get mBitmap():egret.Bitmap
        {
        return this.enter;
        }



    }
}
