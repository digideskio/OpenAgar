"use strict"
/*
    OpenAgar - Open source web game
    Copyright (C) 2016 Andrew S
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var pluginParser = require('./pluginParser.js')
var fs = require('fs')
var ini = require('../modules/ini.js')
module.exports = class PluginService {
    constructor(main) {
        this.vars = ["configs","commands","addToHelp","gamemodes","chatCommands","chatHelp"]
        this.main = main
        this.plugins = {};
        this.pdata = {}
        this.commands = {};
        this.addToHelp = [];
        this.data = {
            main: main,
            log: main.log
            
        }
        this.chatC = {};
        this.chatA = [];
        this.gamemodes = []
        this.configs = ini.parse(fs.readFileSync(__dirname + '/../settings/pluginConfig.ini',"utf8"))
        if (this.configs.allowed) this.configs.allowed = this.configs.allowed.split(",")
        this.parser = new pluginParser(function(a) {main.log("gre{[PluginService]} ".styleMe() + a)}.bind(this),__dirname + "/../plugins",this.vars,this.data,_version,this.configs.allowed,this.configs.dev == 1)
    
 
    } 
    stop() {
   for (var i in this.plugins) {
       var plugin = this.plugins[i]
      if (plugin.stop) plugin.stop()
      }
   this.plugins = {};
        this.pdata = {};
    }
    init() {
        this.parser.init()  
        this.plugins = this.parser.getPlugins()
        this.pdata = this.parser.getData()
        var command = this.getData('chatCommands')
         var help = this.getData('chatHelp')
        this.chatC = {}
        this.chatA = []
        command.forEach((comm)=>{
                if (!comm) return;
               for (var i in comm) {
                    this.chatC[i] = comm[i]
                    
                }
            })
             help.forEach((help)=>{
                   this.chatA = this.chatA.concat(help)
                   })
        var command = this.getData('commands')
      var help = this.getData('addToHelp')
      var gamemodes = this.getData('gamemodes')
      this.commands = {};
     
          this.addToHelp = [];
      help.forEach((help)=>{
                   this.addToHelp = this.addToHelp.concat(help)
                   })
            command.forEach((comm)=>{
                if (!comm) return;
               for (var i in comm) {
                    this.commands[i] = comm[i]
                    
                }
            })
            gamemodes.forEach((gamemode)=>{
                if (!gamemode) return;
                gamemode.forEach((g,i)=>{
                    if (!g || !g.id || !g.name) return;
                    this.gamemodes[parseInt(g.id)] = g
                })
            })
       for (var i in this.plugins) {
           var plugin = this.plugins[i]
       }
        
    }
    reload() {
        this.init()
    }
    getData(data) {
        if (data) {
            return this.pdata[data]
        } else {
            return this.pdata
        }
    }
    send(event,data) {
        if (!data.log) data.log = this.main.log;
        if (!data.main) data.main = this.main;
        if (!data.pluginService) data.pluginService = this;
     for (var i in this.plugins) {
         var plugin = this.plugins[i]
            if (plugin && plugin[event]) {
               if (plugin[event](data) === false) return false;
            }
            continue;
        }
        return true;
    }
    getPlugins() {
        return this.plugins
    }
    
  
    
    
}
