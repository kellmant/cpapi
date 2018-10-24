#!/bin/bash 
#

#-------------------------------------------------------------
export EDITOR=vim
alias vi='vim'

#-------------------------------------------------------------
# File & strings related functions:
#-------------------------------------------------------------


# Local Variables:
# mode:shell-script
# sh-shell:bash
# End:
export CLICOLOR=1
export CLICOLOR_FORCE=G
#export LSCOLORS=ExFxBxDxCxegedabagacad
#export LSCOLORS=gxBxhxDxfxhxhxhxhxcxcx
export HISTFILESIZE=8192
export HISTSIZE=4096
#export HISTIGNORE="ls:cd*:pwd:ll:la:history:h:exit:"
export HISTIGNORE="exit"
alias clearhistory='echo clear > ~/.bash_history'



# User specific aliases and functions

export TZ='America/Toronto'

alias flc='fleetctl list-units --fields sub,unit,active,machine | sort -k 4 -g'
alias howis='fleetctl journal --lines 32'
alias trace='fleetctl journal --follow'
alias start='fleetctl start'
alias stop='fleetctl stop'
alias load='fleetctl load'
alias unload='fleetctl unload'
alias submit='fleetctl submit'
alias destroy='fleetctl destroy'

alias cleanscreen='reset ; resize'

#if [ ! -f $HOME/.vimrc ] ; then
#    echo "Setting up editor . . . "
#    mkdir -p $HOME/.vim/autoload
#    mkdir -p $HOME/.vim/bundle
#    curl -o $HOME/.vim/autoload/pathogen.vim -L https://raw.githubusercontent.com/tpope/vim-pathogen/master/autoload/pathogen.vim
#cat > $HOME/.vimrc <<EOF
#execute pathogen#infect()

#filetype plugin indent on
#syntax on
#syntax enable
#set background=dark
#colorscheme solarized
#set term=xterm
#EOF

#cd $HOME/.vim/bundle
#git clone https://github.com/plasticboy/vim-markdown 
#git clone https://github.com/pangloss/vim-javascript
#git clone https://github.com/klen/python-mode
#git clone https://github.com/ekalinin/dockerfile.vim
#git clone https://github.com/othree/html5.vim
#git clone https://github.com/elzr/vim-json
#git clone git://github.com/altercation/vim-colors-solarized.git

#fi

#TermRecord -o /hack/index.html

echo "Starting human pre run interface" 
cat /etc/motd
echo 
echo "Interdimensional Portal starting $(hostname) service for $BUDDY"
echo " . . . . . . . . . . . . . . . . . . . . . . . . . . "
echo "Active Sessions:"
echo " $(tmux -S /socket/$BUDDY list-sessions) "
echo
yoda-said
echo
echo "Hit enter to attach. . . "
read junk
echo 
echo 
echo
#export TERM=screen-256color
if [ ! -f ~/.vimrc ] ; then
/usr/local/bin/setup_blog
fi
        
etcdctl --endpoints http://keystore.east1:2379 set /usr/$BUDDY/ninja/start "$(date -u +%s)"
tmux -S /socket/$BUDDY attach -t $BUDDY || { tmux -S /socket/$BUDDY new -A -s $BUDDY "bash -l" ; }
echo ". . . closing session."
echo
shellstart=$(etcdctl --endpoints http://keystore.east1:2379 get usr/$BUDDY/ninja/start)
shellstop=$(date -u +%s)
(( shelltime = shellstop - shellstart ))
nicedate=$(date '+%a %b %d %r')
etcdctl --endpoints http://keystore.east1:2379 set usr/$BUDDY/ninja/$shellstart "$nicedate exit after $(($shelltime/3600)) hours $(($shelltime%3600/60)) minutes $(($shelltime%60)) seconds"
    etcdctl --endpoints http://keystore.east1:2379 rm /usr/$BUDDY/ninja/start
#source ~/.bash_profile
echo
echo ". . . dumping keystore . . ."
#/usr/local/bin/dumpkeys
TSTAMP=$(date +%s)
curl -L http://keystore.toonces:2379/v2/keys/?recursive=true -o /web/${TSTAMP}dump.json
#TermRecord -o /hack/live.html -c 'bash -l'
#mv -f /hack/index.html /hack/$(date +"%y%m%d-%H%M%S").html
#mv -f /hack/live.html /hack/index.html
echo ". . . End of session."
exit

