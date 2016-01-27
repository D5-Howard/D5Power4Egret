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
 * Created by Administrator on 2015/5/22.
 */
module d5power {
    export class Notice extends egret.Sprite
    {
        protected  delete_fun:Function;
        protected  _stayTime:number;

        public static  STARTY:number = 80;

        private static noticeMap:Array<any> = [0,0,0,0,0,0];
        private  autoShift:number = 0;
        public constructor(stg:egret.Stage,content:string,dfun:Function=null,config:any=null)
        {
            super();
            this.delete_fun = dfun;
            this._stayTime=120;
            this.buildBuffer(content,config);

            // 开始自动寻找位置
            var fond:Boolean=false;
            for(var i:number = 0,j:number=Notice.noticeMap.length;i<j;i++)
            {
                if(Notice.noticeMap[i]==0)
                {
                    Notice.noticeMap[i] = this;
                    this.x = (stg.stageWidth - this.width)*.5;
                    this.y = Notice.STARTY+i*(this.height+5);
                    fond = true;
                    break;
                }
            }

            if(!fond)
            {
                (<d5power.Notice>Notice.noticeMap[this.autoShift])._stayTime = 0;
                Notice.noticeMap[this.autoShift] = this;
                this.x = (stg.stageWidth - this.width)*.5;
                this.y = Notice.STARTY+this.autoShift*(this.height+5);
                this.autoShift++;
                if(this.autoShift>=Notice.noticeMap.length) this.autoShift=0;
            }

            stg.addChild(this);
        }
        
        protected buildBuffer(content:string,config:any):void
        {
            var color:number = config==null || config.color==null ? 0x00FF00 : config.color;
            var padding:number = 1;
            
            var lable:egret.TextField = new egret.TextField();
            
            lable.width = 200;
            lable.height = 30;
            lable.text = content;
            lable.size = config==null || config.size==null ? 16 : config.size;
            lable.textColor = color;
            lable.textAlign = egret.HorizontalAlign.CENTER;

            if(config!=null && config.bgcolor!=null)
            {
                this.graphics.beginFill(config.bgcolor,(config!=null && config.bgalpha!=null ? .6 : config.bgalpha));
                this.graphics.drawRect(0,0,lable.width+padding*2,lable.height+padding*2);
                this.graphics.endFill();
            }

            this.addChild(lable);

            this.cacheAsBitmap=true;

            this.addEventListener(egret.Event.ENTER_FRAME,this.onEnterFrameHander,this);

        }
        protected onEnterFrameHander(e:egret.Event):void
        {
            if(this._stayTime<=0)
            {
                if((this.alpha-0.05)>0)
                {
                    this.alpha-=0.05;
                }else{
                    this.removeEventListener(egret.Event.ENTER_FRAME,this.onEnterFrameHander,this);
                    if(this.parent)this.parent.removeChild(this);
                    if(this.delete_fun!=null) this.delete_fun(this);
                    var id:number = Notice.noticeMap.indexOf(this);
                    if(id!=-1)
                    {
                        Notice.noticeMap[id] = 0;
                    }
                    return;
                }
                return;
            }
            this._stayTime--;
        }
        public get height():number
        {
            return this.$getHeight();
        }


    }
}
