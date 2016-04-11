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
    export class D5RadioBtn extends D5Component
    {
        private a:egret.Bitmap;

        private data:D5UIResourceData;

        private _selected:boolean = false;

        private _lable:d5power.D5Text;

        public constructor()
        {
            super();
        }

        public setLable(lab:string):void
        {
            if(this._lable==null)
            {
                this._lable = new d5power.D5Text();
                this._lable.setFontSize(d5power.D5Style.default_btn_lable_size);
                this._lable.setFontBold(d5power.D5Style.default_btn_lable_bold);
                if(d5power.D5Style.default_btn_lable_border!=-1) this._lable.setFontBorder(d5power.D5Style.default_btn_lable_border);
                this.addChild(this._lable);
            }
            this._lable.setText(lab);
        }

        private autoLableSize():void
        {
            if(this._lable==null || this.a==null) return;

            trace(this.a.height,this._lable.height,"左左右右");
//            this._lable.autoGrow();
            this._lable.x = this.a.width;
            this._lable.y = (this.a.height-this._lable.height)>>1;

        }

        public setSelected(value:boolean):void
        {
            this._selected = value;
            this.updateFace();
        }

        public get selected():boolean
        {
            return this._selected;
        }

        private updateFace():void
        {
            if(this._selected){
                this.a.texture = this.data.getResource(2);
                this.invalidate();
            }else{
                this.a.texture = this.data.getResource(0);
                this.invalidate();
            }

        }

        public enabled(b:boolean):void
        {
            if(b) {
                this.a.texture = this.data.getResource(0);
            }
            else{
                this.a.texture = this.data.getResource(3);
            }
            this.invalidate();
        }

        public setSkin(name:string):void
        {
            if(this._nowName == name) return;
            this._nowName = name;
            this.data = D5UIResourceData.getData(name);
            if(this.data==null)
            {
                trace("[D5RadioBtn]No Resource"+name);
                return;
            }

            this.a = new egret.Bitmap();
            this.a.texture = this.data.getResource(0);

            this.touchEnabled = true;
            this.enabled(true);
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.btnDown,this);
            this.addEventListener(egret.TouchEvent.TOUCH_END,this.btnUp,this);

            this.invalidate();

        }

        private btnDown(evt:egret.TouchEvent):void
        {
            this.a.texture = this.data.getResource(2);
            this.invalidate();
        }

        private btnUp(evt:egret.TouchEvent):void
        {
            this.setSelected(!this._selected);
        }

        public draw():void
        {
            if(this.a==null)
            {

            }else{

                if(!this.contains(this.a)) {
                    this.addChildAt(this.a,0);

                }
            }

            super.draw();
            if(this._lable != null)
            {
                this.addChild(this._lable);
                this.autoLableSize();
            }

        }
        public dispose():void
        {
            if(this.a)
            {
                if(this.a.parent)this.a.parent.removeChild(this.a);
                this.a.texture = null;
                this.a = null;
            }
            if(this._lable)
            {
                if(this._lable.parent)this._lable.parent.removeChild(this._lable);
                this._lable = null;
            }
            this.data = null;
        }



    }
}

