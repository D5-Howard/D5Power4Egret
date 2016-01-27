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
    export class EffectMakcer {
        /**
         * 渲染速度
         */
        private static _renderSpeed:number=120;
        
        /**
         * 特效数据
         */
        private _data:EffectData;
        /**
         * 特效发起人
         */
        private _owner:IGD;
        /**
         * 特效目标
         */
        private _target:IGD;
        /**
         * 特效保持时间，0为自动
         */
        private _keep_time:number;
        /**
         * 虚拟帧
         */
        private frame:number = 0;
        /**
         * 特效产生坐标，若为0，则使用发起人当前坐标
         */
        private _posx:number;
        /**
         * 特效产生坐标，若为0，则使用发起人当前坐标
         */
        private _posy:number;
        /**
         * 特效产生时的系统时间戳
         */
        private _live:number;
        /**
         * 是否删除
         */
        public deleting:boolean;
        /**
         * 循环帧
         */
        private _loopFream:number;
        /**
         * 技能id
         */
        private _skill:number;
        
        private _layers:Array<EffectLayer>;
        
        public static setRenderFPS(v:number)
        {
            v = v>60 ? 60 : v;
            v = v<1 ? 1 : v;
            EffectMakcer._renderSpeed = 1000/v;
        }
        
        public get owner():IGD
        {
            return this._owner;
        }
        
        public get target():IGD
        {
            return this._target;
        }
        
        public get posx():number
        {
            return this._posx;
        }
        
        public get posy():number
        {
            return this._posy;
        }
        
        public get skillid():number
        {
            return this._skill;
        }
        
        public constructor(data:EffectData,keep:number = 0,posx:number=0,posy:number=0,doer:IGD=null,target:IGD=null,skill:number=0){
            this._owner = doer;
            this._target = target;
            this._data = data;
            this._posx = posx;
            this._posy = posy;
            this._keep_time = keep;
            this._live = d5power.D5Game.me.timer;
            this._loopFream = target==null ? data.loopFream : 0;
            this._layers = [];
            this._skill = skill;
            
            for(var i:number=0,j:number=data.implements.length;i<j;i++)
            {
                var layer:EffectLayer = new EffectLayer(data.implements[i],this);
                this._layers.push(layer);
            }
        }
        
        private resetFream(t:number):void
        {
            this.frame = 0;
            if(this.deleting || this._keep_time>0 && t-this._live>this._keep_time)
            {
                this.deleting = true;
            }
        }
        
        private _lastTime:number = 0;
        public render(t:number):void
        {
            if(this._loopFream==0)
            {
                if(this._target.displayer && this._target.displayer.spriteSheet)
                {
                    this.frame = this._target.displayer.playFream;
                }else{
                    this.frame++;
                    if(this.frame>this._data.loopFream) this.resetFream(t);
                }
            }else{
                this.frame++;
                if(this.frame>this._loopFream) this.resetFream(t);
            }
            
            for(var i:number=0,j:number=this._layers.length;i<j;i++)
			{
				this._layers[i].render(this.frame,t);
			}
        }
    }
}
