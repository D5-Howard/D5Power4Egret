/**
 * Created by Administrator on 2015/5/7.
 */
module d5power
{
    export class D5ConfigCenter
    {
        /**
         * 是否开启特效系统
         */
        public static effectSwitch:boolean=false;
        
        private _pickupTime:number = 5;
        public  get pickupTime():number
        {
            return this._pickupTime;
        }
        protected static _my:D5ConfigCenter;

        public static get my():D5ConfigCenter {
            return D5ConfigCenter._my;
        }
        private _parent:any;
        /**
         * 加载完成的回叫函数
         */
        protected _onComplate:Function;
        protected _baseitemList:Object; //基础物品数据
        protected _baseskillList:Object; //技能配置数据
        protected _monsterConf:Object;
        protected _npcList:Object; //npc数据
        protected _jobList:Object;//职业配置数据
        protected _userProList: Object;//玩家属性配置
        protected _effectList:any;
        /**
         * 任务库
         */
        protected _missionLib:Object;
        /**
         * 任务节点
         */
        protected _missionList:Object;
        /**
         * 章节
         */
        protected _chapterList:Object;
        /**
        * 玩家等级配置
        */
        protected _userLvList:Object;

        public maxChapter:number;
        
        public constructor(callback:Function,parent:any)
        {
            if(D5ConfigCenter.my!=null)
            {
                this.D5error();
            }
            D5ConfigCenter._my = this;
            this._parent = parent;
            this._onComplate = callback;
            this._baseitemList = new Object();
            this._baseskillList = new Object();
            this._monsterConf = new Object();
            this._npcList = new Object();
            this._jobList = new Object();
            this._userProList = new Object();
            this._userLvList = new Object();
            this._missionLib = new Object();
            this._missionList = new Object();
            this._chapterList = new Object();
            this.loadConfigCenter();
        }
        
        public loadEffect():void
        {
            this._effectList = {};
            RES.getResByUrl("resource/assets/data/effect.json",this.onEffectConfig,this);
        }
        
        private onEffectConfig(data:any):void
        {
            for(var i:number=0;i<data.length;i++)
            {
                var c:EffectData = new EffectData();
                c.format(data[i]);
                trace("[D5ConfigCenter] add effect ",c.name);
                this._effectList[c.name] = c;
            }
        }
        
        private loadConfigCenter():void
        {
            RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onLoadComplete,this);
            RES.loadGroup("configcenter");
            
            if(D5ConfigCenter.effectSwitch) this.loadEffect();
        }
        private onLoadComplete(event:RES.ResourceEvent):void {
            if(event.groupName=="configcenter"){
                RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onLoadComplete,this);
                this.parseData();
            }
        }
        /**
         * 获得等级配置
         * @param	lv	等级
         */
        public  getLvData(lv:number):LvData
        {
            return this._userLvList[lv];
        }

        /**
         * 最大等级
         */
        private _maxLv: number = 100;
        public  get maxLv():number
        {
            return this._maxLv;
        }
        public parseData():void
        {
            this.parseBaseItemList();
            this.parseBaseSkillList(); //技能相关
            this.parseNpcList(); //npc相关
            this.parseMonsterConfigList();
            this.parseJobList();//职业相关
            this.parseMissionLib();//任务库相关
            this.parseMissionList();//章节树
            this.parseBaseLvProList();//
            this._onComplate.apply(this._parent);
        }
        private parseBaseLvProList():void
        {
            var obj:any = RES.getRes("lv");
            if(obj)
            {
                var arr:Array<any> = obj.lv;
                var len:number = arr.length;
                var data:any;
                for(var i:number = 0;i < len;i++) {
                    data = arr[i];
                    var item:d5power.LvData = new d5power.LvData();
                    item.formatObject(data);
                    this._userLvList[item.lv] = item;
                }
                this.parseLvProList();
            }
        }
        public parseLvProList():void
        {
        }
        /**
         *任务库 解析
         */
        private parseMissionLib():void
        {
            var obj:any = RES.getRes("missionLib");
            var arr:Array<any> = obj.mission;
            var len:number = arr.length;
            var data:any;
            for(var i:number = 0;i < len;i++) {
                data = arr[i];
                var mission:d5power.MissionData = new d5power.MissionData();
                mission.formatFromJson(data);
                this._missionLib[mission.id] = mission;
            }
        }
        
        public getEffectData(name:string):EffectData
        {
            if(this._effectList==null) return null;
            return this._effectList[name];
        }
        
        public getMissionData(id:number):d5power.MissionData
        {
            if(!this._missionLib.hasOwnProperty(id.toString()))
                return null;
            else
                return this._missionLib[id];
        }
        private parseMissionList():void
        {
            var obj:any = RES.getRes("chapter");
            var arr:Array<any> = obj.chapter;
            var len:number = arr.length;
            this.maxChapter = len;
            var data:any;
            var obj:any;
            var nodeObj:any;
            for(var i:number = 0;i < len;i++) {
                data = arr[i];
                var chapter:ChapterData = new ChapterData();
                chapter.id = parseInt(data.id);
                chapter.add = data.add;
                chapter.info = data.info;
                for(var j:number = 0;j < data.section.length;j++)
                {
                    obj = data.section[j];
                    var part:PartData = new PartData();
                    part.id = parseInt(obj.id);
                    if(obj.tree)
                    {
                        part.tree['startId'] = parseInt(obj.tree.startId);
                        for(var k:number = 0;k< obj.tree.tree.length;k++)
                        {
                            nodeObj = obj.tree.tree[k];
                            var mission:MissionNode = new MissionNode();
                            mission.chapterId = chapter.id;
                            mission.partId = part.id;
                            mission.format(nodeObj);
                            this._missionList[mission.chapterId+'_'+mission.partId+'_'+mission.id] = mission;
                        }
                    }
                    chapter.partArray.push(part);
                }
                this._chapterList[chapter.id] = chapter;
            }
        }
        public getChapterData(id:number):ChapterData
        {
            if(!this._chapterList.hasOwnProperty(id.toString()))
                return null;
            else
                return this._chapterList[id];
        }
        public getMissionNode(chapterId:number,partId:number,id:number):MissionNode
        {
            if(!this._missionList.hasOwnProperty(chapterId+'_'+partId+'_'+id))
                return null;
            else
                return this._missionList[chapterId+'_'+partId+'_'+id];
        }

        /**
         *npc 配置相关
         */
        private parseNpcList():void
        {
            var obj:any = RES.getRes("npcConfig");
            var arr:Array<any> = obj.npc;
            var len:number = arr.length;
            var data:any;
            for(var i:number = 0;i < len;i++) {
                data = arr[i];
                var npc:d5power.NpcData = new d5power.NpcData();
                npc.format(data);
                this._npcList[npc.id] = npc;
            }
        }
        public getNpcConf(id:number):d5power.NpcData
        {
            if(!this._npcList.hasOwnProperty(id.toString()))
                return null;
            else
                return this._npcList[id];
        }

        private parseMonsterConfigList():void
        {
            var obj:any = RES.getRes("monsterConfig");
            var arr:Array<any> = obj.monster;
            var len:number = arr.length;
            var data:any;
            for(var i:number = 0;i < len;i++)
            {
                data = arr[i];
                var monster:d5power.MonsterConfData = new d5power.MonsterConfData();
                monster.format(data);
                this._monsterConf[monster.id] = monster;
            }
        }

        public getMonsterConf(id:number):d5power.MonsterConfData
        {
            if(!this._monsterConf.hasOwnProperty(id.toString()))
                return null;
            else
                return this._monsterConf[id];
        }
        private parseUserProList():void
        {
            var obj:any = RES.getRes("userProConfig");
            var arr:Array<any> = obj.data;
            var len:number = arr.length;
            var data:any;
            for(var i:number = 0;i < len;i++)
            {
                data = arr[i];
                var userPro:UserProData = new UserProData();
                userPro.format(data);
                this._userProList[userPro.field] = userPro;
            }
        }
        /**
         * 获得角色属性配置
         */
        public getUserproConfig(filed:string):UserProData
        {
            return this._userProList[filed];
        }
        /**
        *职业配置相关
        */ 
        private parseJobList():void 
        {
            var obj:any = RES.getRes("jobConfig");
            var arr:Array<any> = obj.job;
            var len:number = arr.length;
            var data:any;
            for(var i:number = 0;i < len;i++)
            {
                data = arr[i];
                var job:JobData = new JobData();
                job.format(data);
                this._jobList[job.id] = job;
            }
        }
        
        public getJobType(job:number):JobData 
        {
            if(!this._jobList.hasOwnProperty(job.toString()))
                return null;
            else
                return this._jobList[job];
        }

        /**
         *技能相关
         */
        private parseBaseSkillList():void
        {
            var obj:any = RES.getRes("skillConfig");
            var arr:Array<any> = obj.skill;
            var length:number = arr.length;
            var data:any;
            for(var i:number = 0;i < length;i++)
            {
                data = arr[i];
                var skill:BaseSkillData = new BaseSkillData();
                skill.baseFormat(data);
                this._baseskillList[skill.id] = skill;
            }
            this.parseSkillList();
        }
        public parseSkillList():void
        {

        }
        public getBaseSkillData(id:number):BaseSkillData
        {
            return this._baseskillList[id];
        }
        
        /**
        * 武学数据库
        */ 
        public  get baseskillList():Object
        {
            return this._baseskillList;
        }
        //---------------物品相关------------------------
        /**
         *物品基础数据
         */ 
        private parseBaseItemList():void
        {
            var obj:any = RES.getRes("itemConfig");
            var arr:Array<any> = obj.item;
            var length:number = arr.length;
            var data:any;
            for(var i:number = 0;i < length;i++)
            {
                data = arr[i];
                var item:BaseItemData = new BaseItemData();
                item.baseFormat(data);
                this._baseitemList[item.id] = item;
            }
            this.parseItemList();

        }
        public parseItemList():void
        {

        }

        public getBaseItemData(id:number):BaseItemData
        {
            return this._baseitemList[id];
        }

        public getBaseItemList():Array<BaseItemData>
        {
            return <Array<BaseItemData>>this._baseitemList;
        }
        private D5error():void
        {
            throw new Error("[D5ConfigCenter] Please get instance by (get me) function.");
        }

    }
}