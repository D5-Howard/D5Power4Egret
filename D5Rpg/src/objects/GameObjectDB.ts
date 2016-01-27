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
 * Created by Administrator on 2015/8/18.
 */
module d5power {
    export class GameObjectDB extends egret.DisplayObjectContainer implements IGO,ISpriteSheetWaiter {

        public static flag:boolean = false;
        public static MAX_POOL_NUM:number = 100;
        private static _pool:Array<GameObjectDB>=[];

        public static getInstance():GameObjectDB
        {
            var obj:GameObjectDB;
            if(GameObjectDB._pool.length)
            {
                obj = GameObjectDB._pool.pop();
            }else{
                obj = new GameObjectDB();
            }

            return obj;
        }

        private static back2pool(obj:GameObjectDB):void
        {
            if(GameObjectDB._pool.length<GameObjectDB.MAX_POOL_NUM && GameObjectDB._pool.indexOf(obj)==-1) GameObjectDB._pool.push(obj);
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

        protected _missionIcon:egret.Bitmap;

        protected _shadow:egret.Bitmap;

        private _lastRender:number;

        private _playFrame:number=0;

        protected _drawAction:Function;

        private _resReady:boolean;

        protected _nameShower:egret.TextField;

        private _alphaCheckTime:number=0;

        protected _loadID:number=0;

        protected _skeletonData:any;
        protected _textureData:any;
        protected _texture:any;

        protected _armature:dragonBones.Armature;
        /**
         * @param    ctrl    控制器
         */
        public constructor() {
            super();
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
            return 0;
        }

        public hitTestArea(px:number,py:number):boolean
        {
            if(this._armature==null) return false;
            var point:egret.Point = D5Game.me.map.getScreenPostion(this._data.posX,this._data.posY);
            return (px>=point.x-this._armature.display.width/2 && py>=point.y-this._armature.display.height && px<point.x+this._armature.display.width/2 && py<=point.y);
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
            RES.getResByUrl(this._data.resStyle+'/skeleton.json', this.onDataComplate, this);
        }
        private onDataComplate(data:any):void
        {
            this._skeletonData = data;
            RES.getResByUrl(this._data.resStyle+'/texture.json',this.onTextureDataComplete, this)
        }
        private onTextureDataComplete(data:any):void
        {
            this._textureData = data;
            RES.getResByUrl(this._data.resStyle+'/texture.png',this.onTextureComplete, this)
        }
        private onTextureComplete(data:egret.Texture):void
        {
            this._texture = data;
            if(this._shadow==null)
            {
                this._shadow = new egret.Bitmap(RES.getRes('shadowIcon'));
                this._shadow.x = -(this._shadow.width>>1);
                this._shadow.y = -(this._shadow.height>>1);
            }
            else{
                this._shadow.texture = RES.getRes('shadowIcon');
            }
            if(!this.contains(this._shadow)) this.addChild(this._shadow);          
            this.createDB();
        }
        private createDB():void
        {
            var factory:dragonBones.EgretFactory = new dragonBones.EgretFactory();
            factory.addSkeletonData(dragonBones.DataParser.parseDragonBonesData(this._skeletonData));
            factory.addTextureAtlas(new dragonBones.EgretTextureAtlas(this._texture, this._textureData));
            
            if(this._armature)
            {
                if(this.contains(this._armature.display)) this.removeChild(this._armature.display);
            }

            this._armature = factory.buildArmature(this._skeletonData.armature[0].name);
            //this._armature.enableAnimationCache(30);
            var armatureDisplay = this._armature.display;
            armatureDisplay.scaleX = armatureDisplay.scaleY = 1;
            this.addChild(armatureDisplay);
            this._armature.animation.gotoAndPlay("action_"+this._data.action,-1,-1,0);
            if(!dragonBones.WorldClock.clock.contains(this._armature)) {
                dragonBones.WorldClock.clock.add(this._armature);
                if(!GameObjectDB.flag)
                {
                    egret.Ticker.getInstance().register(function (advancedTime) {
                        dragonBones.WorldClock.clock.advanceTime(advancedTime / 1000);
                    }, this);
                    GameObjectDB.flag = true;
                }
            }
            this.showMissionIcon();
            this.showPos();
        }
        public dispose():void {
            if (this._spriteSheet)
            {
                this._spriteSheet.unlink();
                this._spriteSheet=null;
            }
            this._data = null;
            this._drawAction = null;
            this._loadID=0;
            if(this._armature)
            {
                if(this.contains(this._armature.display)) this.removeChild(this._armature.display);
                if(dragonBones.WorldClock.clock.contains(this._armature)) {
                    dragonBones.WorldClock.clock.remove(this._armature);
                    egret.Ticker.getInstance().unregister(function (advancedTime) {
                        dragonBones.WorldClock.clock.advanceTime(advancedTime / 1000);
                    }, this);
                }
                this._armature=null;
            }
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
            if(this._shadow)
            {
                this._shadow.texture=null;
                if(this.contains(this._shadow)) this.removeChild(this._shadow);
            }

            if(this._hpBar && this.contains(this._hpBar))this.removeChild(this._hpBar);
            if(this._spBar && this.contains(this._spBar))this.removeChild(this._spBar);
            this._hpBar = null;
            this._spBar = null;
            GameObjectDB.back2pool(this);
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
                if(this._armature)this._armature.display.alpha = D5Game.me.map.isInAlphaArea(this._data.posX,this._data.posY) ? .5 : 1;
            }
        }

        public setupSkin(res:string)
        {
            this._drawAction = this.drawDB;
            if(this._data.action == Actions.Attack)
            {
                if(this._armature)this._armature.animation.gotoAndPlay("action_"+this._data.action,-1,-1,1);
                if(this._armature)this._armature.addEventListener(dragonBones.AnimationEvent.COMPLETE, this.onAnimationEvent,this);
            }
            else
            {
                if(this._armature)this._armature.animation.gotoAndPlay("action_"+this._data.action,-1,-1,0);
            }
            this.showMissionIcon();
        }
        private onAnimationEvent(evt: dragonBones.AnimationEvent):void
        {
            this['atkfun']();
            this._armature.removeEventListener(dragonBones.AnimationEvent.COMPLETE, this.onAnimationEvent,this);
            this._data.setAction(Actions.Wait);
        }

        public onSpriteSheepReady(data:IDisplayer):void
        {

        }

        private showMissionIcon():void
        {
            if(this._missionIcon != null && this._armature) {
                this._missionIcon.y = -this._armature.display.height - this._missionIcon.height;
                this._missionIcon.x = -(this._missionIcon.width >> 1);
                if(!this.contains(this._missionIcon)) this.addChild(this._missionIcon);
            }

            if(this._data!=null && this._data.nickname!=null)
            {
                if(this._nameShower==null) this._nameShower=new egret.TextField();
                this._nameShower.size = 12;
                this._nameShower.textColor = D5Game.me.characterData.camp==this._data.camp?0x99ff00 : 0xff0000;
                this._nameShower.text = this._data.nickname;
                this._nameShower.x = -(this._nameShower.width>>1);
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
        public playEffectNow(value:Array<any>):void
        {

        }

        public showPos():void
        {

        }
        private drawDB():void
        {
            if(this._armature)
            {
                if (this._data.direction <= 4) {
                    this._armature.display.scaleX = 1;
                }
                else {
                    this._armature.display.scaleX = -1;
                }
            }
        }

    }
}