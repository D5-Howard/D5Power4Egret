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
 * Created by Administrator on 2015/1/19.
 */
module d5power
{
    export class CharacterData  implements ICharacterData,IMissionDispatcher
    {
        public _talkWithNpc:Array<any>;
        /**
         * 玩家当前处于的章id
         */
        public _chapterID:number = 0;
        /**
         * 玩家当前处于的节id
         */
        public _partID:number = 0;
        /**
         * 新的任务列表
         */
        public _missionList:Array<any>;
        /**
         * 未激活的任务列表
         */
        public _noActiveList:Array<any>;

        public nickname:string;
        /**
         * 系统配置的起始任务ID
         */
        private _startMission:number = 0;
        /**
        * 玩家阵营
        */ 
        public camp:number = 0;
        
        /**
        * 玩家用户ID
        */ 
        public uid:number = 0;
        
        /**
        * 当前所在地图
        */ 
        public mapid:number;
        
        /**
        * 所在坐标X
        */ 
        public posx:number;
        
        /**
        * 所在坐标Y
        */ 
        public posy:number;
        
        private _money:number;
        
        protected _userdataDisplayer:IUserInfoDisplayer;
        /**
         * 任务配置加载队列
         */
        private _missionLoadingList:Array<any>;
        private _missionIsLoading:boolean;
        private _onAddMission:Function;
        private _onAddMissionThis:any;

        /**
         * 用于存放UI界面的数组。当用户属性发生变化的时候，将逐个通知这些界面。
         */
        private _uiList:Array<IUserInfoDisplayer>;
        private _waitDispathTimer:egret.Timer;

        public constructor()
        {
            this._missionList = [];
            this._noActiveList = [];
            this._missionLoadingList = [];
            this._talkWithNpc = [];
            this._uiList = [];
        }

        public addDisplayer(ui:IUserInfoDisplayer):void
        {
            if(ui==null) return;
            if(this._waitDispathTimer==null)
            {
                this._waitDispathTimer = new egret.Timer(500);
                this._waitDispathTimer.addEventListener(egret.TimerEvent.TIMER,this.onDispathTimer,this);
            }
            // 清理目前已经不在舞台上的UI界面
            if(this._uiList.length>0)
            {
                for(var i:number=this._uiList.length-1;i>=0;i--)
                {
                    if(<egret.DisplayObject><any>(this._uiList[i])==null) this._uiList.splice(i,1);
                }
            }

            if(this._uiList.indexOf(ui)==-1) this._uiList.push(ui);
        }

        public removeDisplayer(ui:IUserInfoDisplayer):void
        {
            var index:number = this._uiList.indexOf(ui);
            if(index!=-1) this._uiList.splice(index,1);
        }
        
        
        public setuserdataDisplayer(value:IUserInfoDisplayer):void
        {
            this._userdataDisplayer = value;
        }

        public updateDisplayers():void
        {
            if(this._uiList.length>0)
            {
                for(var i:number=0,j:number=this._uiList.length;i<j;i++)
                {
                    this._uiList[i].update();
                }
            }
        }

        public  dispathChange():void
        {
            if(this._uiList.length==0 || this._waitDispathTimer.running) return;
            this._waitDispathTimer.start();
        }
        
        private onDispathTimer(e:egret.TimerEvent):void
        {
            this._waitDispathTimer.reset();
            this._waitDispathTimer.stop();
            trace("延迟更新完成。");
            this.changeHP();
            if(this._uiList.length>0)
            {
                for(var i:number=0,j:number=this._uiList.length;i<j;i++)
                {
                    this._uiList[i].update();
                }
            }

            this.flushMissionNpc();
            this.checkActiveMission();
            //D5Game.me.setCharacterData(RPGI.Global.userdata);
        }
        public changeHP():void
        {
            
        }
        public get missionNum():number
        {
            return this._missionList.length;
        }

        /**
         * 设置一个当获得任务的时候调用的函数
         * 本参数可用于根据任务打开UI面板等和任务相关的调用
         * @param	f	调用的参数，回叫时将提供一个uint型的任务ID
         */
        public onAddMission(f:Function,thisobj:any){
            this._onAddMission = f;
            this._onAddMissionThis = thisobj;
        }

        public getMissionByIndex(index:number):any
        {
            if(index>=this._missionList.length) return null;
            return this._missionList[index].missionData;
        }

        /**
         * 通过任务id 获取相关任务数据
         * @param id 任务ID
         */
        public getMissionById(id:number):MissionData
        {
            var length:number = this._missionList.length;
            for(var i:number = 0;i < length;i++){
                var obj:MissionData = this._missionList[i];
                if(obj.id==id) return obj;
            }
            return null;
        }

        /**
         * 获取任务数据
         * @param mission_id 任务ID
         */
        public addMissionById(mission_id:number = 0):void{
            if(this.hasMission(mission_id) || this._missionLoadingList.indexOf(mission_id)!=-1) return;
            this._missionLoadingList.push(mission_id);
            if(this._missionLoadingList.length>0) this.loadMissionConfig();
        }

        public setStartMission(v:number){
            this._startMission = v;
            this.addMissionById(this._startMission);
        }

        public get startMission():number{
            return this._startMission;
        }

        /**
         * 刷新任务，尝试完成现有任务
         */
        public flushMission():void{
            var length:number = this._missionList.length;
            for(var i:number = 0;i < length;i++){
                var mis:MissionData = this._missionList[i];
                //mis.complate(this);
            }
        }

        public checkActiveMission():void
        {

        }

        /**
         * 刷新当前场景中的NPC任务状态
         */
        public flushMissionNpc():void
        {

        }

        public hasMission(mid:number = 0):boolean{
            for(var i:number=0,j:number=this._missionList.length;i<j;i++){
                if(this._missionList[i].id==mid) return true;
            }
            return false;
        }

        /**
         * 是否有某个ID的任务
         */
        public hasMissionById(id:number = 0):boolean{
            var length:number = this._missionList.length;
            for(var i:number = 0;i < length;i++){
                var obj:MissionData = this._missionList[i];
                if(obj.id==id) return true;
            }

            return false;
        }

        /**
         * 获取最后一个任务ID
         */
        public get lastMissionid():number{
            var id:number = 0;
            var length:number = this._missionList.length;
            for(var i:number = 0;i < length;i++){
                var obj:MissionData = this._missionList[i];
                return id;
            }
        }

        private loadMissionConfig():void
        {
            if(this._missionIsLoading) return;

            if(this._missionLoadingList.length==0){
                D5Game.me.missionLoaded();
                this.updateDisplayers();
                return;
            }
            this._missionIsLoading = true;
            console.log("[CharacterData]加载任务："+this._missionLoadingList[0]+".json");
            RES.getResByUrl(D5Game.RES_SERVER + D5Game.ASSET_PATH + "/data/mission/"+this._missionLoadingList[0]+".json", this.onMissionConfigComplate, this);
        }

        private onMissionConfigComplate(data:any):void{

            this._missionIsLoading = false;

            var missionData:MissionData = new MissionData();
            missionData.formatFromJson(data);
            this._missionList.push(missionData);
            this._missionLoadingList.shift();
            this.loadMissionConfig();

            if(this._onAddMission!=null) this._onAddMission(missionData.id);
        }

        public deleteMission(m:any):void{
            this._missionList.splice(this._missionList.indexOf(m),1);
        }
        public addMission(m:any):void
        {

        }

        public hasItemNum(itemid:number = 0):number{
            return 0;
        }

        public hasTalkedWith(npcid:number = 0):boolean{
            return true;
        }

        public killMonseterNum(monsterid:number = 0):number{
            return 0;
        }

        public hasBuff(id:number = 0):boolean{
            return false;
        }

        public hasEqu(id:number = 0):boolean{
            return false;
        }

        public hasSkill(id:number,lv:number = 0):boolean{
            return false;
        }

        public hasSkin(path:string):boolean{
            return false;
        }

        public userPro(pro_name:string,value:number = 0):boolean{
            return false;
        }

        public getItem(itemid:number,num:number,packageid:number=0,equ:boolean=false):boolean{
            return true;
        }
        public addPro(pro_name:string,value:number):boolean
        {
            return true;
        }
        public learnSkill(id:number,up:number,needCost:boolean=false):boolean
        {
            return true;
        }

        public getExp(num:number = 0):void{
        }
        public delItem(itemid:number,num:number):boolean
        {
            return false;
        }


        /**
        * 给予游戏币
        */ 
        public  getMoney(u:number):boolean
        {
            if(u<0 && this._money<-u) return false;
            this._money+=u;
            if(this._userdataDisplayer!=null) this._userdataDisplayer.update();
            return true;
        }

        public hasChecker(type:number = 0):boolean{
            return false;
        }

        public publicCheck(type:number,value:string,num:string):boolean{
            return false;
        }

        public  checkSkillByID(skillID:number):any
        {
            return null;
        }
        public check():void
        {
        }
    }
}