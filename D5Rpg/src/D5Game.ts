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
    export class D5Game extends egret.DisplayObjectContainer {
        /**
         * 游戏中的每“米”对应程序中的像素值
         */ 
        public static MI:number = 50;
        /**
         * 游戏资源服务器，留空则为本地素材相对路径
         */ 
        public static RES_SERVER:string = '';
        /**
         * 游戏资源的保存目录
         */ 
        public static ASSET_PATH:string = 'resource/assets';

        private _effectList:Array<EffectObject>;
        private _effectMackerList:Array<EffectMakcer>;
        private _dataList:Array<IGD>;
        protected _screenList:Array<IGD>;
        private _g: D5Gravity;
        private _characterData:CharacterData;
        private _missionDispatcher:IMissionDispatcher;

        protected _container_map:egret.DisplayObjectContainer;
        protected _container_far: egret.DisplayObjectContainer;
        protected _container_bottom:egret.DisplayObjectContainer;
        protected _container:egret.DisplayObjectContainer;
        protected _container_top:egret.DisplayObjectContainer;
        protected _touch_layer:egret.Sprite;
        
        public fightController:IFightController;

        protected _timer:number;
        private _readyBack:Function;
        protected _map:IMap;
        protected _player:IGD;
        protected _startX:number;
        protected _startY:number;
        private _camera:ICamera;
        private _screenW:number;
        private _screenH:number;
        private _lastZorder:number=0;
 
        protected _firstEnter:boolean = true;

        /**
         * 怪物刷新配置
         */
        protected _monsterConf:Array<MonsterFlushData>;


//        private _dialog:IDialog;
        /**
         * 当前的渲染进度
         */
        private _nowRend:number;
        
        private _runAction:any;

        private static _me:D5Game;


        public static get me():D5Game {
            return D5Game._me;
        }
        
        /**
         * 打开特效系统
         */
        public static openEffectSystem():void
        {
            D5ConfigCenter.effectSwitch= true;
            if(D5ConfigCenter.my==null) return;
            D5ConfigCenter.my.loadEffect();
        }
        
        public runScript(url:string):void
        {

        }
        

        public constructor(mapid:number,startx:number,starty:number,onReady:Function = null) {
            super();
            if (D5Game._me) this.error();
            this.touchEnabled = true;
            D5Game._me = this;

            this._runAction = this.run;
            this._startX = startx;
            this._startY = starty;

            this.buildMap(mapid);
            this._readyBack = onReady;
            this._camera = new D5Camera();

            this._container_map = new Layer();
            this._container = new Layer();
            this._container_far = new Layer();
            this._container_bottom = new Layer();
            this._container_top = new Layer();
            this._touch_layer = new egret.Sprite();
            this._touch_layer.touchEnabled=true;


            this.addChild(this._container_far);
            this.addChild(this._container_map);
            this.addChild(this._container_bottom);
            this.addChild(this._container);
            this.addChild(this._container_top);
            this.addChild(this._touch_layer);

            this._dataList = [];
            this._screenList = [];
            this._effectList = [];
            this._effectMackerList = [];
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.install, this);
            /**
             * 重力跳跃测试
             */ 
            var that = this;
            document.addEventListener("keydown",function(event){

                        if(that._g &&event.keyCode == 32 ) 
                        {
                            that.player.inG = true;
                            that.player.speedY = -20;
                        }
                    }
              )
        }
        
        public get topLayer():Layer
        {
            return this._container_top;
        }
        
        public get bottomLayer():Layer
        {
            return this._container_bottom;
        }

        public openGravity():void
        {
            if(!this._g)
            {
                this._g = new D5Gravity();
                this._g.initGravity(0.8);
            }
        }
        
        /**
         * 重力感应控制器 
         */ 
        public get g():D5Gravity
        {
            return this._g;
        }

        public setCharacterData(data:CharacterData)
        {
            if(this._characterData!=null)
            {
                return;
            }

            this._characterData = data;
        }

        public setMissionDispatcher(data:IMissionDispatcher):void
        {
            if(this._missionDispatcher!=null) return;
            this._missionDispatcher = data;
        }

        public get missionDispatcher():IMissionDispatcher
        {
            return this._missionDispatcher;
        }

        public get characterData ():CharacterData
        {
            return this._characterData;
        }

        public initUI():void
        {

        }
        public showPackage(): void
        {

        }
        public showChapterWin():void
        {

        }
        public showMission(): void
        {

        }
        public showScript(): void
        {

        }

//        public setDialogUI(ui:IDialog):void
//        {
//            this._dialog = ui;
//        }
        public notice(msg:string):void
        {
            new d5power.Notice(D5Game.me.stage,msg);
        }

        public collectionWithNPC(igd:IGD):void
        {
        }
        public pickupItem():void
        {
        }
        public canclePickup():void
        {

        }
        public pickup(time:number,callback:Function):void
        {

        }
//------------------------华丽丽的分割线-----------------------------------------
        public scriptWithNPC(igd:d5power.IGD):void
        {
            this.runScript(igd.script);
        }
        public talkWithNPC(igd:IGD):void
        {

        }

        public missionDialog(headurl:string,igd:IGD):void
        {

        }
        public onSelect(igd:IGD,index:number):void
        {

        }
        public showCheckMission(igd:IGD):void
        {

        }

        public dialog(url:string,nickname:string,say:string,igd:IGD = null):void
        {

        }

        public closeDialog():void
        {
        }
        public showNpcWindow(npc:IGD):void
        {

        }

//------------------------华丽丽的分割线-----------------------------------------


        public alert(msg:string,ok:Function,cancle:Function,thisObj:any):void
        {

        }
        public reLive():void
        {

        }
        public get timer():number
        {
            return this._timer;
        }

        public get screenWidth():number {
            return this._screenW;
        }

        public get screenHeight():number {
            return this._screenH;
        }

        public get camera():ICamera {
            return this._camera;
        }

        public get map():IMap {
            return this._map;
        }

        public get dataList():Array<IGD> {
            return this._dataList;
        }
        public get sceneList():Array<IGD> {
            return this._screenList
        }

        public get player():IGD {
            return this._player;
        }
        public  getIGDByUid(id:number):d5power.IGD
        {
            var data:Array<d5power.IGD> = this._dataList;
            for(var i:number = 0;i<data.length;i++)
            {
                if(data[i].uid==id)
                {
                    return data[i];
                }
            }
            return null;
        }
        public setPlayer(data:IGD){
            this._player = data;
            this.add2Screen(data);
        }
        
        public addEffect(v:EffectObject):void
        {
            this._effectList.push(v);
        }

        public addObject(data:IGD):void {
            this._dataList.push(data);
        }

        public removeObject(index:number):void {
            var data:IGD = this._dataList[index];
            data.dispose();
            this._dataList.splice(index, 1);
        }

        public getClicker(px:number,py:number):IGD
        {
            var i:number,j:number;
            var testList:Array<IGD> = new Array<IGD>();

            var igd:IGD;
            for(i=0,j=this._screenList.length;i<j;i++)
            {
                igd = this._screenList[i];
                if(igd.work==GOData.WORK_NORMAL)continue;
                if(igd.work!=GOData.WORK_DOOR && igd!=this._player && igd.displayer.hitTestArea(px,py)) testList.push(igd);
            }

            var shortY = function(a:IGD,b:IGD):number
            {
                if(a.zOrder>b.zOrder)
                    return 1;
                else if(a.zOrder==b.zOrder)
                    return 0;
                else
                    return -1;
            }

            testList.sort(shortY);
            return testList[0];
        }

        /**
         * 任务加载完成后触发
         */
        public missionLoaded():void
        {
            var igd:IGD;
            for(var i:number = 0,j:number=this._screenList.length;i<j;i++)
            {
                igd = this._screenList[i];
                igd.loadMission();
            }
        }

        /**
         * 将某个角色添加进游戏场景
         * @param data          角色数据
         */
        public add2Screen(data:IGD):void {
            if(!data.inScreen)
            {
                data.setInScreen(true);
                console.log("[D5Game] in screen");
                // 这里需要关联GameObject进
                if(data.work == GOData.WORK_EVENT)
                {
                    data.setDisplayer(EventObject.getEvent());
                }
                else
                {
                    data.setDisplayer(data.work == GOData.WORK_DOOR? DoorObject.getDoor() :data.isDB==1?GameObjectDB.getInstance(): GameObject.getInstance());
                }
                this._screenList.push(data);
                this._container.addChild(<egret.DisplayObject><any>data.displayer);
                if(data.work == GOData.WORK_NPC) data.loadMission();
                if(this._g) this._g.addObject(data);
            }
        }

        public remove4Screen(data:IGD):void {
            data.setInScreen(false);
            if (data.displayer == null) return;
            var index:number = this._screenList.indexOf(data);
            if (index != -1) this.remove4ScreenByIndex(index);
        }

        public remove4ScreenByIndex(index:number):void {
            var data:IGD = this._screenList[index];
            if(this._container.contains(<egret.DisplayObject><any>data.displayer)) this._container.removeChild(<egret.DisplayObject><any>data.displayer);
            data.setDisplayer(null);
            this._screenList.splice(index, 1);
        }


        public changeMap(tomap:number, tox:number, toy:number):void {
            this.reset();
            this._startX = tox;
            this._startY = toy;
            this.enterMap(tomap);
        }
        /**
         * 创建NPC
         * @param    s            位图资源名
         * @param    resname        缓冲池资源名
         * @param    name        NPC姓名
         * @param    pos            目前所在位置
         */
        public createNPC(s:string, nickname:string, pos:egret.Point):IGD {
            var data:GOData = GOData.getInstance();
            data.setRespath(D5Game.RES_SERVER + D5Game.ASSET_PATH + '/mapRes/' + s);
            data.setDirection(Direction.Down);
            data.setNickname(nickname);
            data.setWork(GOData.WORK_NPC);
            if (pos != null) data.setPos(pos.x, pos.y);

            this.addObject(data);

            return data;
        }
        public createRoad(s:string, pos:egret.Point):IGD {
            var data:GOData = GOData.getInstance();
            data.setRespath(D5Game.RES_SERVER + D5Game.ASSET_PATH + '/mapRes/' + s);
            data.setDirection(Direction.Down);
            data.setWork(GOData.WORK_DOOR);
            if (pos != null) data.setPos(pos.x, pos.y);

            this.addObject(data);

            return data;
        }

        /**
         * 根据配置文件进行场景的数据初始化
         */
        public setup(data:any):void {
            this._monsterConf = new Array<any>();
            this._map.setContainer(this._container_map);
            this._map.setup(
                parseInt(data.id),
                parseInt(data.mapW),
                parseInt(data.mapH),
                parseInt(data.tileX),
                parseInt(data.tileY),
                this.init,
                this
            );

            if(data.gravity == "1") this.openGravity();
            if(data.music !="") 
            {
                RES.getResByUrl(D5Game.RES_SERVER + data.music, this.playMusic, this);
            }
            if(data.far) {
                for(var i: number = 0;i < data.far.length;i++) {
                    var far: any = data.far[i];
                    if(far.far != "") {
                        var fartype: number = 0;
                        if(far.farType != "") fartype = parseInt(far.farType);
                        this._map.setupFar(far.far,fartype,this._container_far,parseInt(far.farX),parseInt(far.farY));
                        break;
                    }
                }
            }
            
            if(data.tiled) {
                for(var i: number = 0;i < data.tiled.length;i++) {
                    var tiled: any = data.tiled[i];
                    if(tiled.tiled != "") {
                        var temp: number = 0;
                        if(tiled.tiledType != "") temp = parseInt(tiled.tiledType);
                        var layer_arr: Array<any> = new Array<any>();
                        if(tiled.tiledLayer != null) {
                            for(var m: number = 0,n: number = tiled.tiledLayer.length;m < n;m++) {
                                var layer: any = tiled.tiledLayer[m];
                                layer_arr.push(layer);
                            }
                        }

                        this._map.setupTiled(tiled.tiled,temp,layer_arr,this._container_bottom);
                        break;
                    }
                }
            }
            for(var i:number = 0;i < data.monster.length;i++){
                var monster:any = data.monster[i];
                var conf:MonsterFlushData = new MonsterFlushData();
                conf.format(monster);
                this._monsterConf.push(conf);
            }


            var length:number = data.npc.length;
            for(var i:number = 0;i < length;i++) {
                var npc:any = data.npc[i];
                var npcData:NpcData = D5ConfigCenter.my.getNpcConf(npc.uid);
                var obj:GOData = GOData.getInstance();
                obj.setDirection(Direction.Down);
                if (npcData)
                {
                    obj.setIsDB(npcData.isDB);
                    if (npcData.isDB == 1) {
                        obj.setResStyle(npcData.skin);
                    } else {
                        obj.setRespath(npcData ? npcData.skin : D5Game.RES_SERVER + D5Game.ASSET_PATH + "/mapRes/" + npc.res);
                    }
                }else
                {
                    obj.setRespath(D5Game.RES_SERVER + D5Game.ASSET_PATH + "/mapRes/" + npc.res);
                }
                obj.setNickname(npc.name);
                obj.setPos(npc.posx,npc.posy);
                obj.setUid(npc.uid);
                obj.setSay(npc.say);
                obj.setScript(npc.script);
                obj.setWork(GOData.WORK_NPC);
                if(npc.job!=null) obj.setJob(parseInt(npc.job.type),npc.job.value,npc.job.num);
                this.addObject(obj);
            }
            var len:number = data.roadpoint.length;
            for(var i:number = 0;i < len;i++){
                var door:any = data.roadpoint[i];
                var obj:GOData = GOData.getInstance();
                obj.setDirection(Direction.Down);
                obj.setRespath(D5Game.RES_SERVER+D5Game.ASSET_PATH+"/mapRes/"+door.res);
                obj.setLink(door.toMap,door.toX,door.toY);
                obj.setPos(door.posx,door.posy);
                obj.setWork(GOData.WORK_DOOR);
                this.addObject(obj);
            }
            if(data.movie)
            {
                for(var i:number = 0;i < data.movie.length;i++){
                    var movie:any = data.movie[i];
                    var obj:GOData = GOData.getInstance();
                    obj.setDirection(Direction.Down);
                    obj.setRespath(D5Game.RES_SERVER+D5Game.ASSET_PATH+"/mapRes/"+movie.res);
                    obj.setPos(movie.posx,movie.posy);
                    this.addObject(obj);
                }
            }
            if(data.event)
            {
                for(var i:number = 0;i < data.event.length;i++){
                    var event:any = data.event[i];
                    var obj:GOData = GOData.getInstance();
                    obj.setChecktime(event.checktime);
                    obj.setChecksize(event.checksize);
                    obj.setCheckdel(event.checkdel);
                    obj.setScript(event.script);
                    obj.setPos(event.posx,event.posy);
                    obj.setWork(GOData.WORK_EVENT);
                    this.addObject(obj);
                }
            }

        }
        private _sound: egret.Sound;
        private  _soundChannel:egret.SoundChannel;
        private playMusic(data:any):void
        {
            if(data)
            {
                this._sound = data;
                this._soundChannel = this._sound.play(0,0);
            }
        }
        
        private stopMusic():void
        {
            if(this._sound && this._soundChannel)
            {
                this._soundChannel.stop();
                this._soundChannel = null;
            }
        }
        
        public flushMoster():void
        {

        }
        public init():void {
            this.flushMoster();
            this.initUI();
            console.log("[D5Game] Engine is ready.enjoy~");
            this.buildPlayer();

            if (this._player) {
                this._player.setPos((<number>this._startX), (<number>this._startY));
                if (this._player.controller) this._player.controller.setupListener();
                this._camera.update();
            } else {
                this._camera.lookAt(this._startX, this._startY);
            }
            if(D5Game.me.g)
            {
//                this._player.controller.walkTo((<number>this._startX),(<number>this._startY));
                if(!D5Game.me.map.getRoadPass((<number>this._startX),(<number>this._startY)))
                {
                    D5Game.me.g.addObject(this._player);
                    this._player.inG = true;
                    this._player.speedY = 3;
                }
            }

            if (this._readyBack != null) {
                this._readyBack();
                this._readyBack = null;
            }


	    // 本代码务必在最后运行。由于设置了角色后，需要通过camera.update方法更新0点位置。只有在正确设置了0点后，再开始渲染，才能保证不会由于镜头瞬间跳跃，区块加载异步处理而导致的花屏。
	    this.play();
        }

        public get touchReciver():egret.Sprite
        {
            return this._touch_layer;
        }

        /**
         * 创建角色，请在子类中重写本方法，创建角色
         * 创建成功后，请通过setPlayer方法，设置为主角
         */
        public buildPlayer():void {

        }

        public play():void {
            this.addEventListener(egret.Event.ENTER_FRAME, this._runAction, this);
        }

        public stop():void {
            this.removeEventListener(egret.Event.ENTER_FRAME, this._runAction, this);
        }

        public createEffectMacker(name:string,keep:number=0,posx:number=0,posy:number=0,doer:IGD=null,target:IGD=null,skill:number=0):void
        {
            var data:EffectData = D5ConfigCenter.my.getEffectData(name);
            if(data==null)
            {
                trace("[D5Game] createEffectMacker: 未找到名为 "+name+" 的特效配置");
                return;
            }
            var effect:d5power.EffectMakcer = new d5power.EffectMakcer(data,keep,posx,posy,doer,target,skill);
            this._effectMackerList.push(effect);
        }

        private run(e:egret.Event = null):void {
            this._timer = egret.getTimer();

            this._map.render(false);

            this._map.runPos(this._dataList);
            
            if(this._g != null) this._g.run();

            for(var i:number=this._screenList.length-1;i>=0;i--)
            {
                if(this._screenList[i].deleting || !this._screenList[i].inScreen) this._screenList.splice(i,1);
            }
            
            for(i=this._effectMackerList.length-1;i>=0;i--)
            {
                if(this._effectMackerList[i].deleting)
                {
                    this._effectMackerList.splice(i,1);
                }else{
                    this._effectMackerList[i].render(this._timer);
                }
            }
            
            for(i=this._effectList.length-1;i>=0;i--)
            {
                if(this._effectList[i].deleting)
                {
                    this._effectList.splice(i,1);
                }else{
                    this._effectList[i].render();
                }
            }

            var needOrder:Boolean = this._timer - this._lastZorder > this._camera.zorderSpeed;

            if (needOrder) {
                this._screenList.sort(function (objA, objB):number {
                    return objA.zOrder > objB.zOrder ? 1 : -1;
                });
                var child:egret.DisplayObject;	// 场景对象

                var max:number = this._screenList.length;
                var item:egret.DisplayObject; // 循环对象

                while (max--) {
                    item = <egret.DisplayObject><any>this._screenList[max].displayer;

                    if (max < this._container.numChildren) {
                        child = this._container.getChildAt(max);
                        if (child != item) {
                            this._container.setChildIndex(item, max);
                        }
                    }
                }
                this._lastZorder = this._timer;
                this._camera.reCut();
            }

            var render:IGD;

            while (true) {
                render = this._screenList[this._nowRend];

                if (render == null) {
                    this._nowRend = 0;
                    break;
                }

                render.renderMe();
                this._nowRend++;

                if (egret.getTimer() - this._timer > D5Camera.RenderMaxTime) break;
            }

            //if(this._player) this._player.setPos(this._player.posX+2,this._player.posY);
            this._camera.update();
        }

        protected buildMap(id:number):void
        {
            this._map = new D5Map(id);
        }

        private reset():void {
            this.stop();
            this.map.clear();
            var i:number;
            for (i = this._screenList.length - 1; i >= 0; i--) this.remove4ScreenByIndex(i);
            for (i = this._dataList.length - 1; i >= 0; i--) this.removeObject(i);
            this.clear();
            this._player=null;
            this._camera.setFocus(null);
            this.stopMusic();
        }
        public clear():void
        {

        }

        private onResize(e:egret.Event):void {
            this._screenW = this.stage.stageWidth;
            this._screenH = this.stage.stageHeight;

            this._touch_layer.graphics.clear();
            this._touch_layer.graphics.beginFill(0,0);
            this._touch_layer.graphics.drawRect(0,0,this._screenW,this._screenH);
            this._touch_layer.graphics.endFill();
            this._touch_layer.width = this._screenW;
            this._touch_layer.height = this._screenH;
        }

        private install(e:egret.Event):void {
            this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.install, this);
            this.stage.addEventListener(egret.Event.RESIZE, this.onResize, this);
            this.onResize(null);
            this.enterMap();
        }

        private enterMap(mapid:number = -1):void {
            RES.getResByUrl(D5Game.RES_SERVER + D5Game.ASSET_PATH + "/tiles/" + (mapid == -1 ? this._map.id : mapid) + "/mapconf.json", this.setup, this);
        }

        private error():void {
            throw new Error("[D5Game] Please get instance by (get me) function.");
        }

    }
}
