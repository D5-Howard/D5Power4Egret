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
    export class GOData implements IGD {

        public static WORK_NORMAL:number = 0;
        public static WORK_NPC:number = 1;
        public static WORK_DOOR:number = 2;
        public static WORK_MONSTER:number = 3;
        public static WORK_EVENT:number = 4;

        public static JOB_COLLECTION:number = 1;
        public static JOB_SHOP:number = 2;
        public static JOB_CHANGE_MAP:number = 3;
        public static JOB_COMPOSE:number = 4;

        private static _pool:Array<GOData>;
        private static _poolNum:number;

        public static initPool(num:number = 400):void {
            if (GOData._pool != null) {
                throw new Error("[GOData] initPool just can run one time.");
                return;
            }
            GOData._poolNum = num;
            GOData._pool = new Array<GOData>();
            for (var i:number = 0; i < GOData._poolNum; i++) GOData._pool.push(new GOData());
        }

        public static getInstance():GOData {
            if (GOData._pool.length > 0) return GOData._pool.pop();
            return new GOData();
        }

        private static back2pool(data:GOData):void {
            if (GOData._pool.length < GOData._poolNum && GOData._pool.indexOf(data) == -1) GOData._pool.push(data);
        }

        private _pos:egret.Point;
        private _controller:IController;
        private _respath:string;
        private _nickname:string;
        private _deleting:boolean;
        private _displayer:IGO;
        private _inScreen:boolean;
        private _direction:number;
        private _action:number;
        private _speed:number=3.0;
        private _uid:number = 0;
        private _say:string;
        private _script:string;
        private _job_type:number;
        private _job_value:string;
        private _job_num:string;
        private _resStyle:string;
        private _missionIndex:number;
        private _missionIndexList:Array<number>;
        private _work:number = 0;
        private _link_map:number;
        private _link_posx:number;
        private _link_posy:number;
        private _camp:number = 0;
        private _hp:number = 0;
        private _maxHp:number;
        private _sp:number;
        private _maxSp:number;

        private _monsterid:number;
        private _ai:BTTree;
        private _fighter:IFighter;

        private _isDB:number = 0;

        private _checktime:number = 0;
        private _checksize:number = 0;
        private _checkdel:number = 0;

        /**
        * 是否处于重力状态
        */ 
        public inG: boolean = true;
        /**
        * 重心 X 加速度
        */
        public speedX:number = 0;
        /**
        * 重力 Y加速度
        */
        public speedY:number = 0;

//        public runGravity(): void
//        {
//            var p0:egret.Point = D5Game.me.map.Postion2Tile(this.posX,this.posY+this._gravitySpeed);
//            // 上升阶段和可通过路点均可任意调整坐标
//            if(this._gravitySpeed<0 || !D5Game.me.map.getRoadPass(p0.x,p0.y))
//            {
//                this._target.setPos(this._target.posX,this._target.posY+this._gravitySpeed);
//                this._gravitySpeed += CharacterController.GRAVITY;
//            }else{
//                this._jumpTime = 0;
//                this._gravitySpeed = 0;
//                this._target.setPos(this._target.posX,p0.y*D5Game.me.map.roadHeight);
//                }
//        }
        
        
        /**
         * 排序调整
         */
        public _zOrderF:number = 0;

        public constructor() {
            this._pos = new egret.Point();
            
        }

        public loadMission():void
        {
            if(this._work!= GOData.WORK_NPC)return;
            if(D5Game.me.characterData)
            {
                var m:MissionData;
                var num:number = D5Game.me.characterData.missionNum;

                this._missionIndex = -1;
                this._missionIndexList = new Array<number>();
                for(var i:number = 0;i<num;i++)
                {
                    m = D5Game.me.characterData.getMissionByIndex(i).missionData;
//                    if(m.mapId>0 && m.mapId!= D5Game.me.map.id)continue;
                    if((m.type==0 &&m.npc_startId == this._uid&&(m.mapId==0||m.mapId== D5Game.me.map.id))||(m.type>0&&m.talkNpcFlag&&m.talkNpcArr.indexOf(this._uid)!=-1) ||(m.type>0&&m.npc_CompleteId == this._uid))
                    {

                        if(this._missionIndex==-1) this._missionIndex = i;
                        this._missionIndexList.push(i);
                    }
                }

                if(this._missionIndex==-1 && this._missionIndexList.length>0)
                {
                    this._missionIndex = this._missionIndexList[0];
                }

                if(this._displayer) this.displayer.showMissionStatus(this._missionIndex);
            }
        }

        public run():void {

            var targetx:number;
            var targety:number;
            var maxX:number = D5Game.me.map.width;
            var maxY:number = D5Game.me.map.height;
            
            this._pos.x += this.speedX;
            this._pos.y += this.speedY;
            
            if(D5Game.me.camera.focus==this){
                targetx = this._pos.x<(D5Game.me.screenWidth>>1) ? this._pos.x : (D5Game.me.screenWidth>>1);
                targety = this._pos.y<(D5Game.me.screenHeight>>1) ? this._pos.y : (D5Game.me.screenHeight>>1);

                targetx = this._pos.x>maxX-(D5Game.me.screenWidth>>1) ? this._pos.x-(maxX-D5Game.me.screenWidth) : targetx;
                targety = this._pos.y>maxY-(D5Game.me.screenHeight>>1) ? this._pos.y-(maxY-D5Game.me.screenHeight) : targety;
            }else{
                var target:egret.Point = D5Game.me.map.getScreenPostion(this._pos.x,this._pos.y);
                targetx = target.x;
                targety = target.y;
            }
            if(this._displayer) {
                this._displayer.x = parseInt(<string><any>targetx);
                this._displayer.y = parseInt(<string><any>targety);
            }
            

            if(this._controller) this._controller.run();
        }

        public setAction(action:number):void
        {
            if(this._action == action) return;
            this._action = action;
            if(this._resStyle!=null) this.setRespath(this._resStyle+'/'+action);
        }

        public get action():number
        {
            return this._action;
        }

        /**
         * 深度排序浮动
         */
        public setZOrderF(val:number) {
            this._zOrderF = val;
        }

        /**
         * 深度排序浮动
         */
        public zOrderF():number {
            return this._zOrderF;
        }

        /**
         * 获取坐标的深度排序
         */
        public get zOrder():number {
            //return zorder;
            return this.posY + this._zOrderF;
        }

        public setDirection(dir:number):void
        {
            this._direction = dir;
        }

        public get direction():number
        {
            return this._direction;
        }

        public setPos(px:number, py:number):void {
            this._pos.x = px;
            this._pos.y = py;
        }

        public get speed():number
        {
            return this._speed;
        }

        public setSpeed(speed:number):void
        {
            this._speed = speed;
        }

        public get $pos():egret.Point {
            return this._pos;
        }

        public get posX():number {
            return this._pos.x;
        }

        public get posY():number {
            return this._pos.y;
        }

        public setController(ctrl:IController) {
            this._controller = ctrl;
        }

        public get controller():IController {
            return this._controller;
        }

        public setRespath(v:string):void {
            this._respath = v;
            if(v!=null && v!='' && this._displayer)
            {
                this._displayer.setupSkin(this._respath);
            }
        }

        public get respath():string {
            return this._respath;
        }


        public setResStyle(dir:string):void
        {
            this._resStyle = dir;
            this.setAction(Actions.Wait);
        }

        public get resStyle():string
        {
            return this._resStyle;
        }

        public setLink(mapid:number,posx:number,posy:number)
        {
            this._link_map = mapid;
            this._link_posx = posx;
            this._link_posy = posy;
        }

        public get linkMap():number
        {
            return this._link_map;
        }

        public get linkPosx():number
        {
            return this._link_posx;
        }

        public get linkPosy():number
        {
            return this._link_posy;
        }

        public setNickname(v:string):void {
            this._nickname = v;
        }

        public get nickname():string {
            return this._nickname;
        }

        public setWork(value:number):void
        {
            this._work = value;
        }

        public get work():number
        {
            return this._work;
        }

        public isNpc():boolean
        {
            return this._work==GOData.WORK_NPC;
        }

        public isDoor():boolean
        {
            return this._work==GOData.WORK_DOOR;
        }

        public dispose():void {

            if(this._controller)
            {
                this._controller.dispose();
            }
            this._controller = null;
            this._deleting = false;
            this._work = GOData.WORK_NORMAL;
            this._inScreen=false;
            this._nickname=null;
            this._respath=null;
            this._resStyle=null;
            this.setCamp(0);
            this.setIsDB(0);
            this.setPos(0,0)
            this.setJob(0,'','0');
            this.setDisplayer(null);
            this.setAI(null);
            this.setUid(0);
            GOData.back2pool(this);
        }

        public setInScreen(b:boolean):void
        {
            this._inScreen = b;
        }

        public get inScreen():boolean{
            return this._inScreen;
        }
        public setCamp(value:number):void
        {
            this._camp = value;
        }

        public get camp():number{
            return this._camp;
        }

        public get deleting():boolean {
            return this._deleting;
        }
        public setDeleting(b:boolean):void
        {
            this._deleting = b;
        }

        public setDisplayer(data:any):void
        {
            if(this._displayer!=null && data==null)
            {
                this._displayer.dispose();
            }
            this._displayer = data;

            if(this._displayer)
            {
                this._displayer.setupData(this);
                if(this.respath!=null && this.respath!='')
                {
                    this._displayer.setupSkin(this.respath);
                }
            }
        }

        public get displayer():IGO {
            return this._displayer;
        }
        public setAI(data:any):void
        {
            this._ai = data;
        }

        public get ai():BTTree {
            return this._ai;
        }

        public setUid(id:number):void
        {
            this._uid = id;
        }

        public get uid():number
        {
            return this._uid;
        }

        public setSay(say:string):void
        {
            this._say = say;
        }

        public get say():string
        {
            var missionData:MissionData = this._missionIndex==-1 ? null : D5Game.me.characterData.getMissionByIndex(this._missionIndex).missionData;
            return missionData==null ? this._say : missionData.npc_said;
        }
        public setScript(script:string):void
        {
            this._script = script;
        }

        public get script():string
        {
            return this._script;
        }

        public get missionIndexList():Array<number>
        {
            return this._missionIndexList;
        }

        public get missionIndex():number
        {
            return this._missionIndex;
        }

        public setJob(type:number,value:string,num:string):void
        {
            this._job_type = type;
            this._job_value = value;
            this._job_num = num;
        }

        public get job_type():number
        {
            return this._job_type
        }

        public get job_value():string
        {
            return this._job_value;
        }

        public get job_number():string
        {
            return this._job_num;
        }
        public renderMe():void
        {
            this.displayer.renderMe();
        }
        public setHp(value:number):void
        {
            if(value<0)
            {
                value = 0;
            }
            this._hp = value>this._maxHp?this._maxHp:value;
        }
        public get hp():number
        {
            return this._hp;
        }
        public setMaxHp(value:number):void
        {
            this._maxHp = value;
            this._hp = value;
        }
        public get maxHp():number
        {
            return this._maxHp;
        }
        public setSp(value:number):void
        {
            if(value<0)
            {
                value = 0;
            }
            this._sp = value>this._maxSp?this._maxSp:value;
        }
        public get sp():number
        {
            return this._sp;
        }
        public setMaxSp(value:number):void
        {
            this._maxSp = value;
            this._sp = value;
        }
        public get maxSp():number
        {
            return this._maxSp;
        }

        public setMonsterid(id:number):void
        {
            this._monsterid = id;
        }

        public get monsterid():number
        {
            return this._monsterid;
        }
        public setIsDB(id:number):void
        {
            this._isDB = id;
        }

        public get isDB():number
        {
            return this._isDB;
        }
        public setChecktime(id:number):void
        {
            this._checktime = id;
        }

        public get checktime():number
        {
            return this._checktime;
        }
        public setChecksize(id:number):void
        {
            this._checksize = id;
        }

        public get checksize():number
        {
            return this._checksize;
        }
        public setCheckdel(id:number):void
        {
            this._checkdel = id;
        }

        public get checkdel():number
        {
            return this._checkdel;
        }

    }
}