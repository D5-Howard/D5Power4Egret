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
    export class GameObject extends egret.DisplayObjectContainer implements IGO,ISpriteSheetWaiter {
        private static _missionIcon:egret.SpriteSheet;

        public static setupMissionIcon(res:egret.Texture):void
        {
            var perW:number = res._bitmapWidth/5;
            var perH:number = res._bitmapHeight;
            GameObject._missionIcon = new egret.SpriteSheet(res);

            for(var i:number=0;i<5;i++) GameObject._missionIcon.createTexture("mission"+i,i*perW,0,perW,perH,0,0);
        }

        public static get MissionTalk():egret.Texture
        {
            return GameObject._missionIcon==null ? null : GameObject._missionIcon.getTexture("mission0");
        }

        public static get MissionOver():egret.Texture
        {
            return GameObject._missionIcon==null ? null : GameObject._missionIcon.getTexture("mission1");
        }

        public static get MissionOver0():egret.Texture
        {
            return GameObject._missionIcon==null ? null : GameObject._missionIcon.getTexture("mission2");
        }

        public static get MissionStart():egret.Texture
        {
            return GameObject._missionIcon==null ? null : GameObject._missionIcon.getTexture("mission3");
        }

        public static get MissionStart0():egret.Texture
        {
            return GameObject._missionIcon==null ? null : GameObject._missionIcon.getTexture("mission4");
        }

        public static MAX_POOL_NUM:number = 100;
        private static _pool:Array<GameObject>=[];

        public static getInstance():GameObject
        {
            var obj:GameObject;
            if(GameObject._pool.length)
            {
                obj = GameObject._pool.pop();
            }else{
                obj = new GameObject();
            }

            return obj;
        }

        private static back2pool(obj:GameObject):void
        {
            if(GameObject._pool.length<GameObject.MAX_POOL_NUM && GameObject._pool.indexOf(obj)==-1) GameObject._pool.push(obj);
        }

        public ID:number = 0;

        public _spriteSheet:IDisplayer;

        /**
         * 是否在场景内
         */
        private _inScreen:boolean;

        protected _camp:number;

        private _deleting:boolean;

        protected _data:IGD;

        protected _hpBar:d5power.HSpBar;
        protected _spBar:d5power.HSpBar;

        protected _monitor:egret.Bitmap;

        protected _missionIcon:egret.Bitmap;

        protected _shadow:egret.Bitmap;

        private _lastRender:number;

        protected _playFrame:number=0;

        protected _drawAction:Function;

        private _resReady:boolean;

        protected _nameShower:egret.TextField;

        private _alphaCheckTime:number=0;

        protected _loadID:number=0;

        private _flag:boolean = false;

        /**
         * @param    ctrl    控制器
         */
        public constructor() {
            super();
            this._monitor = new egret.Bitmap();
        }
        public get loadID():number
        {
            return this._loadID;
        }
        public get inScreen():boolean {
            return this._inScreen;
        }

        public get deleteing():boolean {
            return this._deleting;
        }
        public get camp():number {
            return this._camp;
        }
        
        public get playFream():number
        {
            return this._playFrame;
        }

        public hitTestArea(px:number,py:number):boolean
        {
            if(this._spriteSheet==null) return false;
            return (px>=this.x+this._spriteSheet.gX && py>=this.y+this._spriteSheet.gY && px<this.x+this._spriteSheet.gX+this._spriteSheet.frameWidth && py<=this.y+this._spriteSheet.gY+this.spriteSheet.frameHeight);
        }


        /**
         * 渲染自己在屏幕上输出
         */
        public renderMe():void {
            // 控制总体刷新率
            this.renderAction();
            this._drawAction!=null ? this._drawAction() : 0;
        }

        public get spriteSheet():IDisplayer {
            return this._spriteSheet;
        }

        public setupData(data:IGD):void{
            this._data = data;
        }

        public dispose():void {
            if (this._spriteSheet)
            {
                this._spriteSheet.unlink();
                this._spriteSheet=null;
            }
            this._data = null;
            this._monitor.texture = null;
            this._drawAction = null;
            this._loadID=0;
            this._playFrame=0;
            if(this._missionIcon)
            {
                this._missionIcon.texture=null;
                if(this.contains(this._missionIcon)) this.removeChild(this._missionIcon);
            }
            if(this._nameShower && this.contains(this._nameShower))
            {
                this._nameShower.text='';
                this.removeChild(this._nameShower);
            }


            if(this.contains(this._monitor)) this.removeChild(this._monitor);
            if(this._shadow)
            {
                this._shadow.texture=null;
                if(this.contains(this._shadow)) this.removeChild(this._shadow);
            }
            if(this._hpBar && this.contains(this._hpBar))this.removeChild(this._hpBar);
            if(this._spBar && this.contains(this._spBar))this.removeChild(this._spBar);
            this._hpBar = null;
            this._spBar = null;
            GameObject.back2pool(this);
        }

        public showMissionStatus(index:number):void
        {
            if(D5Game.me.characterData==null || D5Game.me.missionDispatcher==null)
            {
                console.log("[GameObject] 暂未设置角色信息存储数据。请通过D5Game.me.characterData进行设置。");
                return;
            }
            if(index==-1)
            {
                if(this._missionIcon && this.contains(this._missionIcon)) this.removeChild(this._missionIcon);
                return;
            }

            if(!this._missionIcon) this._missionIcon = new egret.Bitmap();

            var m:MissionData = D5Game.me.characterData.getMissionByIndex(index).missionData;

            if(m)
            {
                var url:string;
                if(m.type==MissionData.TYPE_GET && m.talkNpcFlag && m.talkNpcArr.indexOf(this._data.uid)!=-1&& !m.check(D5Game.me.missionDispatcher))
                {
                    this._missionIcon.texture = GameObject.MissionTalk;
                }
                else if(m.type==MissionData.TYPE_GET && m.check(D5Game.me.missionDispatcher))
                {
                    this._missionIcon.texture = GameObject.MissionOver;
                }else if(m.type==MissionData.TYPE_GET){
                    this._missionIcon.texture = GameObject.MissionOver0;
                }else if(m.type==0 &&m.isActive){
                    this._missionIcon.texture = GameObject.MissionStart;
                }else{
                    this._missionIcon.texture = GameObject.MissionStart0;
                }

                this.showMissionIcon();
            }
        }

        /**
         * 渲染动作
         */
        public renderAction():void
        {
            if(D5Game.me.timer-this._alphaCheckTime>500)
            {
                this._alphaCheckTime = D5Game.me.timer;
                this._monitor.alpha = D5Game.me.map.isInAlphaArea(this._data.posX,this._data.posY) ? .5 : 1;
            }
        }

        public setupSkin(res:string)
        {
            //console.log("[GameObject] Res is load."+res);
            // 更换动作，将原来的皮肤释放掉
            this._loadID++;
            //if (this._spriteSheet) this._spriteSheet.unlink();
            D5SpriteSheet.getInstance(res,this);
        }

        public onSpriteSheepReady(data:IDisplayer):void
        {
            if (this._spriteSheet) this._spriteSheet.unlink();
            this._drawAction = this.draw;
            //console.log("[GameObject] Res is ready");
            this._spriteSheet = data;
//            if(this._spriteSheet.shadowX!=0 && this._spriteSheet.shadowY!=0)
//            {
//                if(this._shadow==null)
//                {
//                    this._shadow = new egret.Shape();
//                }else{
//                    this._shadow.graphics.clear();
//                }
//                this._shadow.graphics.lineStyle();
//                this._shadow.graphics.beginFill(0,0.2);
//                this._shadow.graphics.drawEllipse(0,0,this._spriteSheet.shadowX,this._spriteSheet.shadowY);
//                this._shadow.graphics.endFill();
//                //if(!this.contains(this._shadow)) this.addChild(this._shadow);
//            }
            if(this._shadow==null)
            {
                this._shadow = new egret.Bitmap(RES.getRes('shadowIcon'));
                this._shadow.x = -(this._shadow.width>>1);
                this._shadow.y = -(this._shadow.height>>1);
                
            }else{
                this._shadow.texture = RES.getRes('shadowIcon');
            }
            if(!this.contains(this._shadow)) this.addChild(this._shadow);
            if(!this.contains(this._monitor)) this.addChild(this._monitor);
 
            this.showMissionIcon();
            this.showPos();
        }

        private showMissionIcon():void
        {
            if(this._missionIcon!=null && this.contains(this._monitor))
            {
                this._missionIcon.y= -this._spriteSheet.frameHeight-this._missionIcon.height;
                this._missionIcon.x = -(this._missionIcon.width>>1);
                if(!this.contains(this._missionIcon)) this.addChild(this._missionIcon);
            }

            if(this._data!=null && this._data.nickname!=null && this.contains(this._monitor))
            {
                if(this._nameShower==null) this._nameShower=new egret.TextField();
                this._nameShower.size = 12;
                this._nameShower.textColor = D5Game.me.characterData.camp==this._data.camp?0x99ff00 : 0xff0000;
                this._nameShower.text = this._data.nickname;
                this._nameShower.x = -(this._nameShower.width>>1);
                this._nameShower.cacheAsBitmap = true;
                //this._nameShower.y = -this._monitor.height-this._nameShower.height;
                this.addChild(this._nameShower);
            }
        }
        /**
         * 设置HP条
         */
        public setHpBar(bar:HSpBar):void
        {
            this._hpBar = bar;
            this.addChild(this._hpBar);
        }
        public updateBar():void
        {
            if(this._hpBar)this._hpBar.update();
            if(this._spBar)this._spBar.update();
        }
        /**
         * 设置SP条
         */
        public setSpBar(bar:HSpBar):void
        {
            this._spBar = bar;
            this.addChild(this._spBar);
        }
        
        public showPos():void
        {

        }
        

        public draw():void
        {
            if(D5Game.me.timer-this._lastRender<this._spriteSheet.renderTime) return;
            this._lastRender = D5Game.me.timer;
            var direction:number = this._data.direction;
            if(this._data.direction<=4)
            {
                if(this._spriteSheet.totalDirection==1)
                {
                    direction = 0;
                    this._monitor.texture = this._spriteSheet.getTexture(direction,this._playFrame);
                }
                else if(this._spriteSheet.totalDirection==4)
                {
                    if(direction ==1||direction==2||direction==3)
                    {
                        direction = 1;
                    }
                    this._monitor.texture = this._spriteSheet.getTexture(direction,this._playFrame);
                }
                else
                {
                    this._monitor.texture = this._spriteSheet.getTexture(direction,this._playFrame);
                }
                this._monitor.scaleX = 1;
                if(this._spriteSheet.uvList)
                {
                    this._monitor.x = this._spriteSheet.uvList[direction*this._spriteSheet.totalFrame+this._playFrame].offX;
                    this._monitor.y = this._spriteSheet.uvList[direction*this._spriteSheet.totalFrame+this._playFrame].offY;
                }
                else
                {
                    this._monitor.x = this._spriteSheet.gX;
                    this._monitor.y = this._spriteSheet.gY;
                }
            }
            else
            {
                if(this._spriteSheet.totalDirection==1)
                {
                    direction = 0;
                    this._monitor.texture = this._spriteSheet.getTexture(direction,this._playFrame);
                }
                else if(this._spriteSheet.totalDirection==4)
                {
                    direction = 1;
                    this._monitor.texture = this._spriteSheet.getTexture(direction,this._playFrame);
                }
                else
                {
                    direction = 8 - this._data.direction;
                    this._monitor.texture = this._spriteSheet.getTexture(direction,this._playFrame);
                }
                this._monitor.scaleX = -1;
                if(this._spriteSheet.uvList)
                {
                    this._monitor.x = -this._spriteSheet.uvList[direction*this._spriteSheet.totalFrame+this._playFrame].offX;
                    this._monitor.y = this._spriteSheet.uvList[direction*this._spriteSheet.totalFrame+this._playFrame].offY;
                }
                else {
                    this._monitor.x = -this._spriteSheet.gX;
                    this._monitor.y = this._spriteSheet.gY;
                }
            }
            this._playFrame++;
            if(this._playFrame>=this._spriteSheet.totalFrame) this._playFrame=0;

            if(this._data.action == d5power.Actions.Attack)
            {
                if(this._playFrame==0 && this._flag)
                {
                    this._data.setAction(d5power.Actions.Wait);
                    this._flag = false;
                }
                if(this._playFrame+1>=this._spriteSheet.totalFrame && !this._flag)
                {
                    this['atkfun']();
                    this._flag = true;
                }
            }

        }

    }
}