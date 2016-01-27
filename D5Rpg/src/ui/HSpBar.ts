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
 * Created by Administrator on 2015/6/11.
 */
module d5power {
    export class HSpBar extends CharacterStuff implements IUserInfoDisplayer
    {
        private color:number;
        /**
         * @param		target		跟踪目标
         * @param		attName		跟踪属性名
         * @param		attMaxName	最大值跟踪
         * @param		ytype		Y轴位置，若大于1则使用该值进行定位
         * @param		resource	使用素材
         */
        public constructor(target:any,attName:string,attMaxName:string,ytype:number = 1,color:number = 0x990000)
        {
            super(target,attName,attMaxName);
            this.color = color;
            this.y = ytype;
            this.x = -(this._size>>1);
            D5Game.me.characterData.addDisplayer(this);
            this.update();
        }
        /**
         * 当前值
         */
        private _nowVal:number;

        public static UP:number = 0;
        public static DOWN:number = 1;

        private  _size:number = 50;
        /**
         * 上次渲染的值，用来进行渲染优化，同值不渲染
         */
        private _lastRender:number;



        private waitForFly(e:egret.TimerEvent):void
        {
        }

        /**
         * 渲染
         * @param		buffer		缓冲区
         * @param		p			角色的标准渲染坐标
         */
        public update():void
        {
            if(this._lastRender==parseInt(this._target[this._attName])) return;
            this._lastRender = parseInt(this._target[this._attName]);
            var max:number = parseInt(this._target[this._attMaxName]);
            this.graphics.clear();
            this.graphics.beginFill(this.color);
            this.graphics.drawRect(0,0,this._size*this._lastRender/max,4);
            this.graphics.endFill();
            this.graphics.lineStyle(1);
            this.graphics.lineTo(this._size,0);
            this.graphics.lineTo(this._size,4);
            this.graphics.lineTo(0,4);
            this.graphics.lineTo(0,0);

        }

    }
}