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
/**
 * Created by Administrator on 2015/6/15.
 */
module d5power {
    export class UFlyFont extends egret.DisplayObjectContainer
    {
        private static _pool:Array<any> = new Array<any>();

        public static getInstance(scene:egret.DisplayObjectContainer,skillName:string,value:boolean = true):UFlyFont
        {
            var obj:UFlyFont;
            if(this._pool.length==0)
            {
                obj = new UFlyFont();
            }else{
                obj = this._pool.pop();
            }
            obj.alpha = 1;
            obj._scene = scene;
            obj.isNumber = value
            obj.buildBuffer(skillName);
            return obj;
        }

        private static inPool(target:UFlyFont):void
        {
            if(this._pool.indexOf(target)==-1) this._pool.push(target);
        }

        private _scene:egret.DisplayObjectContainer;
        private isNumber:boolean;
        protected  _shower:any;
        private  stayTime:number;
        private  xspeed:number;
        private  yspeed:number ;

        /**
         * @param	scene		场景
         * @param	skillName	技能名称
         * @param	color		字体颜色
         */
        public constructor()
        {
            super();
        }

        protected buildBuffer(name:string):void
        {
            if(this._shower)
            {
                if(this._shower instanceof NumberBitmap) this._shower.removeChildren();
                this._shower = null;
            }
            if(this.isNumber)
            {
                this._shower = new NumberBitmap(name);
            }
            else
            {
                this._shower = new egret.TextField();
            }
            this.addChild(this._shower);

            this.xspeed = Math.random()>0.5 ? 2 : -2;
            this.yspeed = 3;
        }
        public setPos(x:number,y:number):void
        {
            this.x = x;
            this.y = y;
            this._scene.addChild(this);
            this.addEventListener(egret.Event.ENTER_FRAME,this.onEnterFrameHander,this);
        }

        private onEnterFrameHander():void
        {
            this.y-=this.yspeed;
            this.x+=this.xspeed;

            if((this.alpha-0.01)>0)
            {
                this.alpha-=0.01;
            }else{
                this.removeEventListener(egret.Event.ENTER_FRAME,this.onEnterFrameHander,this);
                if(this.parent)this.parent.removeChild(this);
                UFlyFont.inPool(this);
                return;
            }
            this.yspeed-=0.08;
        }
    }
}
